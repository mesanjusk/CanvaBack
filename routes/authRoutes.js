const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function buildUserPayload(user, school) {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
    schoolId: school?._id || null,
    schoolName: school?.name || null,
    schoolCode: school?.code || null,
    modulesEnabled: school?.modulesEnabled || [],
  };
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username }).lean();
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const school = user.schoolId ? await School.findById(user.schoolId).lean() : null;
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    res.json({ success: true, token, user: buildUserPayload(user, school) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const school = req.user.schoolId ? await School.findById(req.user.schoolId).lean() : null;
  res.json({ success: true, user: buildUserPayload(req.user, school) });
});

module.exports = router;
