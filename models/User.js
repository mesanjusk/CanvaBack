const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  user_uuid: {
    type: String,
    default: uuidv4,
    unique: true
  },

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },

  mobile: {
    type: String,
    unique: true,
    sparse: true
  },

  login_username: {
    type: String,
    required: true,
    unique: true
  },

  login_password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['superadmin', 'owner', 'admin', 'staff', 'student', 'guest', 'parent'],
    default: 'admin'
  },

  institute_uuid: {
    type: String,
    required: true,
    index: true // Keep this one, it's not duplicated
  },

  last_login_at: {
    type: Date,
    default: null
  },

  last_activity_at: {
    type: Date,
    default: null
  },

  last_password_change: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// ❌ Remove these to avoid warnings
// userSchema.index({ login_username: 1 });
// userSchema.index({ mobile: 1 });
// userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
