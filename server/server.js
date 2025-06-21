// backend/server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const predictRoute = require('./routes/predictRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/predict', predictRoute);

// Root route
app.get('/', (req, res) => {
  res.send('🍷 Wine Quality Prediction API is running 🎯');
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: '🔍 Route not found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('🔥 Internal Server Error:', err);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
