const express = require('express');
const School = require('../models/School');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', requirePermission('school.read'), async (req, res) => {
  const filter = req.user.role === 'super_admin' ? {} : { _id: req.user.schoolId };
  const schools = await School.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: schools });
});

router.post('/', requirePermission('school.read'), async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Only super admin can create schools' });
  }

  const { school, adminUser } = req.body;
  const createdSchool = await School.create({ ...school, createdBy: req.user._id });

  let createdAdmin = null;
  if (adminUser?.username && adminUser?.password && adminUser?.name) {
    const passwordHash = await bcrypt.hash(adminUser.password, 10);
    createdAdmin = await User.create({
      name: adminUser.name,
      username: adminUser.username,
      passwordHash,
      role: 'school_admin',
      schoolId: createdSchool._id,
      phone: adminUser.phone || '',
      email: adminUser.email || '',
      createdBy: req.user._id,
    });
  }

  res.status(201).json({ success: true, data: { school: createdSchool, admin: createdAdmin } });
});

router.put('/:id', requirePermission('school.update'), async (req, res) => {
  const school = await School.findById(req.params.id);
  if (!school) return res.status(404).json({ success: false, message: 'School not found' });
  if (req.user.role !== 'super_admin' && String(req.user.schoolId) !== String(school._id)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }
  Object.assign(school, req.body || {});
  await school.save();
  res.json({ success: true, data: school });
});

module.exports = router;
