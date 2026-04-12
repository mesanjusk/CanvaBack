const express = require('express');
const School = require('../models/School');
const User = require('../models/User');
const Student = require('../models/Student');
const Template = require('../models/Template');
const EditRequest = require('../models/EditRequest');
const IdCardRecord = require('../models/IdCardRecord');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', requirePermission('dashboard.read'), async (req, res) => {
  const schoolFilter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };
  const idCardFilter = req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId };

  const [schools, users, students, templates, editRequests, records] = await Promise.all([
    School.countDocuments(req.user.role === 'super_admin' ? {} : { _id: req.user.schoolId }),
    User.countDocuments(schoolFilter),
    Student.countDocuments(schoolFilter),
    Template.countDocuments(schoolFilter),
    EditRequest.countDocuments({ ...schoolFilter, status: 'pending' }),
    IdCardRecord.countDocuments(idCardFilter),
  ]);

  res.json({
    success: true,
    data: { schools, users, students, templates, pendingCorrections: editRequests, cardRecords: records },
  });
});

module.exports = router;
