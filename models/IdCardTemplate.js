const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const idCardTemplateSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  orientation: { type: String, enum: ['portrait','landscape'], default: 'portrait' },
  backgroundImage: { type: String, default: '' },
  width: { type: Number, default: 54 },
  height: { type: Number, default: 86 },
  unit: { type: String, default: 'mm' },
  fields: { type: [String], default: ['studentName','className','section','rollNumber'] },
  styles: { type: mongoose.Schema.Types.Mixed, default: {} },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('IdCardTemplate', idCardTemplateSchema);
