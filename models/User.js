const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'school_admin', 'principal', 'teacher', 'operator', 'student'],
      required: true,
    },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    assignedClassIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    assignedSectionNames: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
