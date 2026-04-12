const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const schoolSettingSchema = new mongoose.Schema({
  uuid: { type: String, default: uuidv4, unique: true },
  institute_uuid: { type: String, required: true, unique: true, index: true },
  schoolName: { type: String, default: '' },
  shortName: { type: String, default: '' },
  tagline: { type: String, default: '' },
  board: { type: String, default: '' },
  principalName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  signatureUrl: { type: String, default: '' },
  theme: {
    primary: { type: String, default: '#2563eb' },
    secondary: { type: String, default: '#0f172a' },
    accent: { type: String, default: '#14b8a6' },
    mode: { type: String, default: 'light' },
  },
  modules: {
    dashboard: { type: Boolean, default: true },
    admissions: { type: Boolean, default: true },
    students: { type: Boolean, default: true },
    idCards: { type: Boolean, default: true },
    reportCards: { type: Boolean, default: true },
    users: { type: Boolean, default: true },
    masters: { type: Boolean, default: true },
  },
  idCardConfig: {
    cardTitle: { type: String, default: 'Student Identity Card' },
    footerText: { type: String, default: 'If found, please return to school office.' },
    fields: { type: [String], default: ['studentName','className','section','rollNumber','admissionNo','dob','mobileParent'] },
  },
  reportCardConfig: {
    title: { type: String, default: 'Scholastic Progress Report' },
    gradingPattern: { type: String, default: 'marks' },
    remarksLabel: { type: String, default: 'Class Teacher Remarks' },
  },
}, { timestamps: true });

module.exports = mongoose.model('SchoolSetting', schoolSettingSchema);
