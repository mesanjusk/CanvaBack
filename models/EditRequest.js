const mongoose = require('mongoose');

const editRequestSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    submittedByType: { type: String, enum: ['student_public', 'teacher', 'admin'], required: true },
    submittedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewComment: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EditRequest', editRequestSchema);
