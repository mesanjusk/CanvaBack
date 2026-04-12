const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const masterSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['class','section','academic_year','exam','subject','grade_scale','house','designation','custom'],
    index: true,
  },
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true, default: '' },
  description: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

masterSchema.index({ institute_uuid: 1, type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Master', masterSchema);
