// server/server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import instructorRoutes from './routes/instructor.js';
import studentRoutes from './routes/student.js';
import quizAttemptRoutes from './routes/quizAttempt.js';
import courseRoutes from "./routes/courses.js"
import quizRoutes from './routes/quizzes.js';
import topicRoutes from "./routes/topic.js"


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/student', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/topics', topicRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5001, () => console.log('Server running on port 5001'));
  })
  .catch((err) => console.error('MongoDB error:', err));

