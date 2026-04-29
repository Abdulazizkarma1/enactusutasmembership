require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const Member = require('./models/Member');
const authMiddleware = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000', 'https://enactusutasmembership.netlify.app').replace(/\/$/, '');
const PORT = Number(process.env.PORT) || 5000;

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/api/auth', authRoutes);

function formatMember(doc) {
  if (!doc) return doc;
  if (typeof doc.toJSON === 'function') return doc.toJSON();
  const o = { ...doc };
  delete o._id;
  delete o.__v;
  return o;
}

function genToken() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ENS-${year}-${suffix}`;
}

async function nextMembershipId(joinDate) {
  const year = joinDate ? new Date(joinDate).getFullYear() : new Date().getFullYear();
  const prefix = `UTAS/ENS/${year}/`;
  const count = await Member.countDocuments({
    membershipId: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
  });
  const seq = count + 1;
  return `${prefix}${String(seq).padStart(3, '0')}`;
}

function memberPayload(body, isUpdate) {
  const allowed = [
    'name',
    'role',
    'department',
    'faculty',
    'photo',
    'email',
    'phone',
    'status',
    'joinDate',
    'expiryDate',
    'contributions',
    'presidentRemark',
  ];
  const out = {};
  for (const key of allowed) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (out.joinDate) out.joinDate = new Date(out.joinDate);
  if (out.expiryDate) out.expiryDate = new Date(out.expiryDate);
  if (out.contributions && Array.isArray(out.contributions)) {
    out.contributions = out.contributions
      .map((c) => ({
        project: String(c?.project || '').trim(),
        role: String(c?.role || '').trim(),
        year: String(c?.year || '').trim(),
        impact: String(c?.impact || '').trim(),
      }))
      .filter((c) => c.project && c.role && c.year && c.impact);
  }
  if (isUpdate) {
    delete out.id;
    delete out.token;
    delete out.membershipId;
    delete out.createdAt;
  }
  return out;
}

// ——— Public: verify by token (no auth) ———
app.get('/api/verify/:token', async (req, res) => {
  try {
    const member = await Member.findOne({ token: req.params.token }).lean();
    if (!member) {
      return res.status(404).json({ error: 'Invalid or unrecognized token' });
    }
    return res.json(formatMember(member));
  } catch (err) {
    console.error('verify error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// ——— Protected: members & stats ———
app.get('/api/members', authMiddleware, async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 }).lean();
    return res.json(members.map(formatMember));
  } catch (err) {
    console.error('list members:', err);
    return res.status(500).json({ error: 'Failed to load members' });
  }
});

app.get('/api/members/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id }).lean();
    if (!member) return res.status(404).json({ error: 'Member not found' });
    return res.json(formatMember(member));
  } catch (err) {
    console.error('get member:', err);
    return res.status(500).json({ error: 'Failed to load member' });
  }
});

app.post('/api/members', authMiddleware, async (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.role || !data.department || !data.faculty) {
      return res.status(400).json({ error: 'name, role, department, and faculty are required' });
    }
    if (!data.email || !data.phone) {
      return res.status(400).json({ error: 'email and phone are required' });
    }
    if (!data.joinDate || !data.expiryDate) {
      return res.status(400).json({ error: 'joinDate and expiryDate are required' });
    }

    const id = uuidv4();
    let token = genToken();
    let exists = await Member.findOne({ token });
    while (exists) {
      token = genToken();
      exists = await Member.findOne({ token });
    }

    const membershipId = await nextMembershipId(data.joinDate);
    const payload = {
      id,
      token,
      membershipId,
      ...memberPayload(data, false),
    };

    const member = await Member.create(payload);
    return res.status(201).json(member.toJSON());
  } catch (err) {
    console.error('create member:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate token or membership ID' });
    }
    return res.status(500).json({ error: 'Failed to create member' });
  }
});

app.put('/api/members/:id', authMiddleware, async (req, res) => {
  try {
    const updates = memberPayload(req.body, true);
    const member = await Member.findOneAndUpdate({ id: req.params.id }, { $set: updates }, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ error: 'Member not found' });
    return res.json(member.toJSON());
  } catch (err) {
    console.error('update member:', err);
    return res.status(500).json({ error: 'Failed to update member' });
  }
});

app.delete('/api/members/:id', authMiddleware, async (req, res) => {
  try {
    const result = await Member.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Member not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('delete member:', err);
    return res.status(500).json({ error: 'Failed to delete member' });
  }
});

app.get('/api/members/:id/qr', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findOne({ id: req.params.id }).lean();
    if (!member) return res.status(404).json({ error: 'Member not found' });

    const verifyUrl = `${CLIENT_URL}/verify/${encodeURIComponent(member.token)}`;

    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0d1b2a', light: '#ffffff' },
    });
    return res.json({ qr: qrDataUrl, url: verifyUrl, token: member.token });
  } catch (err) {
    console.error('qr:', err);
    return res.status(500).json({ error: 'QR generation failed' });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const [total, active, inactive, deptAgg] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'active' }),
      Member.countDocuments({ status: 'inactive' }),
      Member.distinct('department'),
    ]);
    return res.json({
      total,
      active,
      inactive,
      departments: deptAgg.filter(Boolean).length,
    });
  } catch (err) {
    console.error('stats:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
});

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to server/.env (see .env.example).');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Enactus Verify API listening on port ${PORT}`);
    console.log(`CORS origin: ${CLIENT_URL}`);
  });
}

start();
