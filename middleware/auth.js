const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');
const { hasPermission } = require('../utils/permissions');

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'school_platform_secret';

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId).lean();
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Invalid user' });

    req.user = user;
    if (user.schoolId) {
      req.school = await School.findById(user.schoolId).lean();
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    if (!hasPermission(req.user, permission)) {
      return res.status(403).json({ success: false, message: 'Permission denied', permission });
    }
    next();
  };
}

module.exports = { requireAuth, requirePermission, JWT_SECRET };
