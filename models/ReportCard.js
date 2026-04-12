const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportCardSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  student_uuid: { type: String, default: '', index: true },
  template_uuid: { type: String, default: '' },
  sourceType: { type: String, enum: ['database', 'excel', 'manual'], default: 'database' },
  studentSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  academicYear: { type: String, default: '' },
  examName: { type: String, default: '' },
  className: { type: String, default: '' },
  section: { type: String, default: '' },
  attendance: { workingDays: Number, presentDays: Number },
  subjects: [{
    subject: String,
    maxMarks: Number,
    obtainedMarks: Number,
    grade: String,
    remarks: String,
  }],
  totals: { total: Number, obtained: Number, percentage: Number, result: String },
  teacherRemarks: { type: String, default: '' },
  principalRemarks: { type: String, default: '' },
  imageDataUrl: { type: String, default: '' },
  pdfDataUrl: { type: String, default: '' },
  shareToken: { type: String, default: '', index: true },
  shareRole: { type: String, enum: ['student', 'teacher', 'admin', 'guardian', 'open'], default: 'teacher' },
  shareExpiresAt: { type: Date, default: null },
  lastEditedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ReportCard', reportCardSchema);
