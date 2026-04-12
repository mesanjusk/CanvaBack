const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function scopeFilter(req) {
  return req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
}

router.get('/', requirePermission('user.read'), async (req, res) => {
  const users = await User.find(scopeFilter(req)).select('-passwordHash').sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: users });
});

router.post('/', requirePermission('user.create'), async (req, res) => {
  const { name, username, password, role, phone, email, studentId, assignedSectionNames = [] } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, username, password and role are required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let linkedStudentId = studentId || null;

  if (role === 'student' && !linkedStudentId) {
    const student = await Student.findOne({ ...scopeFilter(req), fullName: name }).lean();
    linkedStudentId = student?._id || null;
  }

  const user = await User.create({
    name,
    username,
    passwordHash,
    role,
    phone: phone || '',
    email: email || '',
    schoolId: req.user.role === 'super_admin' ? req.body.schoolId || null : req.user.schoolId,
    studentId: linkedStudentId,
    assignedSectionNames,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { ...user.toObject(), passwordHash: undefined } });
});

router.put('/:id', requirePermission('user.update'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (req.user.role !== 'super_admin' && String(user.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }

  const allowed = ['name', 'role', 'phone', 'email', 'isActive', 'assignedSectionNames', 'studentId'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  if (req.body.password) user.passwordHash = await bcrypt.hash(req.body.password, 10);
  await user.save();
  res.json({ success: true, data: { ...user.toObject(), passwordHash: undefined } });
});

module.exports = router;
