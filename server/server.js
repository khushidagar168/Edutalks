// server/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import instructorRoutes from './routes/instructor.js';
import studentRoutes from './routes/student.js';
import quizAttemptRoutes from './routes/quizAttempt.js';
import quizRoutes from './routes/quizzes.js';


dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/quizzes', quizRoutes);


// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/quiz_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch(err => console.error('❌ MongoDB error:', err));
