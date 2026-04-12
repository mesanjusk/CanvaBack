const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const reportCardTemplateSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  academicYear: { type: String, default: '' },
  examName: { type: String, default: '' },
  subjectColumns: { type: [String], default: ['subject','maxMarks','obtainedMarks','grade'] },
  gradingScale: { type: mongoose.Schema.Types.Mixed, default: {} },
  remarksEnabled: { type: Boolean, default: true },
  attendanceEnabled: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ReportCardTemplate', reportCardTemplateSchema);
