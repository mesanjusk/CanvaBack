const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const idCardRecordSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  template_uuid: { type: String, required: true, index: true },
  student_uuid: { type: String, default: '', index: true },
  sourceType: { type: String, enum: ['database', 'excel', 'manual'], default: 'database' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['draft', 'pending_photo', 'ready', 'approved'], default: 'draft' },
  imageDataUrl: { type: String, default: '' },
  pdfDataUrl: { type: String, default: '' },
  shareToken: { type: String, default: '', index: true },
  shareRole: { type: String, enum: ['student', 'teacher', 'admin', 'guardian', 'open'], default: 'student' },
  shareExpiresAt: { type: Date, default: null },
  lastEditedBy: { type: String, default: '' },
}, { timestamps: true });

idCardRecordSchema.index({ institute_uuid: 1, template_uuid: 1, createdAt: -1 });

module.exports = mongoose.model('IdCardRecord', idCardRecordSchema);
