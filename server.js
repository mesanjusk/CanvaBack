const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Increase payload size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ Proper CORS setup for Vercel frontend
app.use(cors({
  origin: 'https://canvas-gray-five.vercel.app',
  credentials: true,
}));

// ✅ Handle preflight requests
app.options('*', cors());

mongoose.connect(process.env.MONGO_URI);

const templateRoutes = require('./routes/templateRoutes');
app.use('/api/templates', templateRoutes);
// Also valid:
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
