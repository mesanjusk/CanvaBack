const express = require('express');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const User = require('../models/User');
const IdCardTemplate = require('../models/IdCardTemplate');
const ReportCardTemplate = require('../models/ReportCardTemplate');
const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const { institute_uuid } = req.query;
    if (!institute_uuid) return res.status(400).json({ success: false, message: 'institute_uuid is required' });

    const [students, admissions, users, idCards, reportCards, recentAdmissions] = await Promise.all([
      Student.countDocuments({ institute_uuid }),
      Admission.countDocuments({ institute_uuid }),
      User.countDocuments({ institute_uuid }),
      IdCardTemplate.countDocuments({ institute_uuid }),
      ReportCardTemplate.countDocuments({ institute_uuid }),
      Admission.find({ institute_uuid }).sort({ createdAt: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      data: {
        cards: [
          { label: 'Students', value: students },
          { label: 'Admissions', value: admissions },
          { label: 'Users', value: users },
          { label: 'ID Card Templates', value: idCards },
          { label: 'Report Card Templates', value: reportCards },
        ],
        recentAdmissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
