const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedAdmin = require('./config/seed');

dotenv.config();

const app = express();
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not defined in environment variables. Using a fallback for development.');
}

// Connect to Database
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/tasks', require('./routes/tasks'));

// Health check with DB status
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'API is running...', 
    database: dbStatus,
    timestamp: new Date()
  });
});

// Basic root path - redirect to frontend or show status
app.get('/', (req, res) => {
  const frontendUrl = 'https://student-management-jade-seven.vercel.app/';
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>SchoolHub API is running</h1>
      <p>This is the backend server. To view the website, click below:</p>
      <a href="${frontendUrl}" style="padding: 10px 20px; background: #2563eb; color: white; border-radius: 5px; text-decoration: none;">Go to Website</a>
      <p style="margin-top: 30px; font-size: 0.8rem; color: #666;">Status: Connected to Database</p>
    </div>
  `);
});

// 404 Handler for API
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
