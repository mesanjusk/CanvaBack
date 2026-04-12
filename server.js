const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const templateRoutes = require('./routes/templateRoutes');
const idCardRoutes = require('./routes/idCardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { bootstrapSuperAdmin } = require('./utils/bootstrap');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'School platform API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/id-cards', idCardRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school-platform';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    await bootstrapSuperAdmin();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection error', error);
    process.exit(1);
  });
