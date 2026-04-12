const express = require('express');
const SchoolSetting = require('../models/SchoolSetting');
const Institute = require('../models/institute');
const router = express.Router();

router.get('/:institute_uuid', async (req, res) => {
  try {
    const { institute_uuid } = req.params;
    let setting = await SchoolSetting.findOne({ institute_uuid });
    if (!setting) {
      const institute = await Institute.findOne({ institute_uuid });
      setting = await SchoolSetting.create({
        institute_uuid,
        schoolName: institute?.institute_title || '',
        contactEmail: institute?.contactEmail || '',
        contactPhone: institute?.institute_call_number || '',
        principalName: institute?.center_head_name || '',
        logoUrl: institute?.logo || '',
        signatureUrl: institute?.signature || '',
        theme: {
          primary: institute?.theme?.color || '#2563eb',
          secondary: institute?.theme?.darkColor || '#0f172a',
          accent: institute?.theme?.accentColor || '#14b8a6',
          mode: 'light',
        },
      });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:institute_uuid', async (req, res) => {
  try {
    const setting = await SchoolSetting.findOneAndUpdate(
      { institute_uuid: req.params.institute_uuid },
      req.body,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
