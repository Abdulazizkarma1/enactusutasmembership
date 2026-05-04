const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Copy server/.env.example to server/.env and configure it.');
    process.exit(1);
  }

  const reset = process.argv.includes('--reset');
  const emailRaw = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!emailRaw || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const email = String(emailRaw).trim().toLowerCase();

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding');

    if (reset) {
      await Admin.deleteMany({});
      console.log('All admins deleted (--reset mode)');
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      console.log(`Admin ${email} already exists. Skipping creation (idempotent).`);
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      const username = email.split('@')[0] || 'admin';
      await Admin.create({
        username,
        email,
        passwordHash,
      });
      console.log(`Admin created: ${email} (${username})`);
    }
  } catch (err) {
    console.error('Seed error:', err.message || err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedAdmin();
