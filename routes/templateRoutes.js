const express = require('express');
const Template = require('../models/Template');
const { requireAuth, requirePermission } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const scope = (req) => (req.user.role === 'super_admin' && req.query.schoolId ? { schoolId: req.query.schoolId } : req.user.role === 'super_admin' ? {} : { schoolId: req.user.schoolId });

router.get('/', requirePermission('template.read'), async (req, res) => {
  const templates = await Template.find(scope(req)).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: templates });
});

router.post('/', requirePermission('template.create'), async (req, res) => {
  const template = await Template.create({
    ...req.body,
    schoolId: req.user.role === 'super_admin' ? req.body.schoolId : req.user.schoolId,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: template });
});

router.put('/:id', requirePermission('template.update'), async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
  if (req.user.role !== 'super_admin' && String(template.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }
  Object.assign(template, req.body);
  await template.save();
  res.json({ success: true, data: template });
});

router.delete('/:id', requirePermission('template.delete'), async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
  if (req.user.role !== 'super_admin' && String(template.schoolId) !== String(req.user.schoolId)) {
    return res.status(403).json({ success: false, message: 'Out of scope' });
  }
  await Template.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
