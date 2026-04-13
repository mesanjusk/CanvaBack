const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const gallaryRoutes = require('./routes/gallaryRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const templateRoutes = require('./routes/templateRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const studentRoutes = require('./routes/studentRoutes');
const admissionRoutes = require('./routes/admissionRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const orgCategoryRoutes = require('./routes/orgCategoryRoutes');
const templateLayoutRoutes = require('./routes/templateLayoutRoutes');
const masterRoutes = require('./routes/masterRoutes');
const schoolSettingRoutes = require('./routes/schoolSettingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const idCardRoutes = require('./routes/idCardRoutes');
const reportCardRoutes = require('./routes/reportCardRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const publicAccessRoutes = require('./routes/publicAccessRoutes');

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors({ origin: true, credentials: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'School API running' }));

app.use('/api/auth', authRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/gallary', gallaryRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/branding', brandingRoutes);
app.use('/api/org-categories', orgCategoryRoutes);
app.use('/api/templatelayout', templateLayoutRoutes);
app.use('/api/masters', masterRoutes);
app.use('/api/school-settings', schoolSettingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/report-cards', reportCardRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/public', publicAccessRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
