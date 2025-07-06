// models/Quiz.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String], // simple string array for multiple-choice
    default: []
  },
  correctAnswer: {
    type: String,
    required: false
  },
  explanation: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  timeLimit: { type: Number, default: 30 }, // in minutes
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
    required: false
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [questionSchema],
    default: []
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Auto-update updated_at on save
quizSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
