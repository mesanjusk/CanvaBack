const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fieldSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, default: '' },
  x: { type: Number, default: 20 },
  y: { type: Number, default: 20 },
  fontSize: { type: Number, default: 12 },
  fontWeight: { type: String, default: '600' },
  color: { type: String, default: '#111827' },
}, { _id: false });

const idCardTemplateSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  orientation: { type: String, enum: ['portrait','landscape'], default: 'portrait' },
  backgroundImage: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  width: { type: Number, default: 54 },
  height: { type: Number, default: 86 },
  unit: { type: String, default: 'mm' },
  photoShape: { type: String, enum: ['rect', 'rounded', 'circle'], default: 'rounded' },
  photoX: { type: Number, default: 18 },
  photoY: { type: Number, default: 18 },
  photoWidth: { type: Number, default: 60 },
  photoHeight: { type: Number, default: 72 },
  title: { type: String, default: 'STUDENT ID CARD' },
  subtitle: { type: String, default: '' },
  footerText: { type: String, default: '' },
  fields: { type: [fieldSchema], default: undefined },
  styles: {
    primaryColor: { type: String, default: '#0f172a' },
    accentColor: { type: String, default: '#2563eb' },
    textColor: { type: String, default: '#111827' },
    cardColor: { type: String, default: '#ffffff' },
  },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

idCardTemplateSchema.pre('validate', function(next) {
  if (!Array.isArray(this.fields) || !this.fields.length) {
    this.fields = [
      { key: 'studentName', label: 'Name', x: 96, y: 26, fontSize: 16, fontWeight: '700', color: '#111827' },
      { key: 'className', label: 'Class', x: 96, y: 52, fontSize: 12, fontWeight: '600', color: '#334155' },
      { key: 'section', label: 'Section', x: 96, y: 70, fontSize: 12, fontWeight: '500', color: '#334155' },
      { key: 'rollNumber', label: 'Roll No', x: 96, y: 88, fontSize: 12, fontWeight: '500', color: '#334155' },
      { key: 'admissionNo', label: 'Admission No', x: 96, y: 106, fontSize: 12, fontWeight: '500', color: '#334155' },
      { key: 'mobileParent', label: 'Parent Mobile', x: 20, y: 182, fontSize: 11, fontWeight: '500', color: '#334155' },
    ];
  }
  next();
});

module.exports = mongoose.model('IdCardTemplate', idCardTemplateSchema);
