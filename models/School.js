const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    principalName: { type: String, default: '' },
    board: { type: String, default: '' },
    sessionLabel: { type: String, default: '' },
    themeColor: { type: String, default: '#1976d2' },
    modulesEnabled: {
      type: [String],
      default: ['dashboard', 'users', 'students', 'templates', 'id_cards', 'report_cards', 'whatsapp_ready'],
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
