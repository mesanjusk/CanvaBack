const express = require('express');
const mongoose = require('mongoose');
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
const cors = require('cors');
require('dotenv').config();

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://canvas-gray-five.vercel.app',
  'https://framee.sanjusk.in'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Preflight requests (important!)
app.options('*', cors(corsOptions));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


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
// Also valid:
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
