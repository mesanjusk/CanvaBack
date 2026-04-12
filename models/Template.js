const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    x: { type: Number, default: 20 },
    y: { type: Number, default: 20 },
    fontSize: { type: Number, default: 16 },
    bold: { type: Boolean, default: false },
    color: { type: String, default: '#111827' },
    width: { type: Number, default: 240 },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['id_card', 'report_card'], default: 'id_card' },
    width: { type: Number, default: 340 },
    height: { type: Number, default: 540 },
    backgroundColor: { type: String, default: '#ffffff' },
    backgroundImageUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    fields: {
      type: [templateFieldSchema],
      default: [
        { key: 'fullName', label: 'Student Name', x: 24, y: 190, fontSize: 20, bold: true, width: 280 },
        { key: 'className', label: 'Class', x: 24, y: 230, fontSize: 16, width: 280 },
        { key: 'section', label: 'Section', x: 24, y: 258, fontSize: 16, width: 280 },
        { key: 'admissionNo', label: 'Admission No', x: 24, y: 286, fontSize: 16, width: 280 },
        { key: 'contactNumber', label: 'Phone', x: 24, y: 314, fontSize: 15, width: 280 },
      ],
    },
    photo: {
      x: { type: Number, default: 108 },
      y: { type: Number, default: 44 },
      width: { type: Number, default: 124 },
      height: { type: Number, default: 124 },
      borderRadius: { type: Number, default: 18 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
