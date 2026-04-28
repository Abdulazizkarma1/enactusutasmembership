const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret);
    const admin = await Admin.findById(decoded.adminId).select('-passwordHash').lean();
    if (!admin) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.admin = admin;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
};
