const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const templateRoutes = require('./routes/templateRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = [
  'http://localhost:5173',
  'https://canvas-gray-five.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));


// ✅ Handle preflight requests
app.options('*', cors());

mongoose.connect(process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/institute', instituteRoutes);
app.use('/api/template', templateRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/subcategory', subcategoryRoutes);
// Also valid:
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
