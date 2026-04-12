const mongoose = require('mongoose');

const idCardRecordSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
    status: { type: String, enum: ['draft', 'generated', 'approved'], default: 'draft' },
    previewPayload: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

idCardRecordSchema.index({ schoolId: 1, studentId: 1, templateId: 1 }, { unique: true });

module.exports = mongoose.model('IdCardRecord', idCardRecordSchema);
