const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    admissionNo: { type: String, default: '' },
    rollNo: { type: String, default: '' },
    fullName: { type: String, required: true },
    className: { type: String, default: '' },
    section: { type: String, default: '' },
    gender: { type: String, default: '' },
    dob: { type: String, default: '' },
    fatherName: { type: String, default: '' },
    motherName: { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'pending_review', 'approved'], default: 'draft' },
    correctedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    publicEditToken: { type: String, default: '' },
    publicEditExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
