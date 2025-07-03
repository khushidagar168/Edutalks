// models/Quiz.js
import mongoose from 'mongoose';
import crypto from 'crypto';

const optionSchema = new mongoose.Schema
({
  text: {
    type: String,
    required: true,
    trim: true
  },
  is_correct: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: true,
    trim: true
  },
  question_type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'fill_blank', 'essay'],
    default: 'multiple_choice'
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(options) {
        return options.length >= 2 && options.length <= 6;
      },
      message: 'Questions must have between 2 and 6 options'
    }
  },
  correct_answer_index: {
    type: Number,
    default: 0
  },
  correct_answer_text: String, // For fill_blank questions
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  time_limit: {
    type: Number,
    default: 60, // seconds
    min: 10,
    max: 600
  },
  tags: [String],
  media: {
    image_url: String,
    video_url: String,
    audio_url: String
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  difficulty_level: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100
  },
  tags: [String],
  time_limit: {
    type: Number,
    default: 30, // minutes
    min: 1,
    max: 300
  },
  passing_score: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  settings: {
    shuffle_questions: {
      type: Boolean,
      default: false
    },
    shuffle_options: {
      type: Boolean,
      default: false
    },
    show_results_immediately: {
      type: Boolean,
      default: true
    },
    allow_review: {
      type: Boolean,
      default: true
    },
    max_attempts: {
      type: Number,
      default: 3,
      min: 1,
      max: 10
    },
    require_all_questions: {
      type: Boolean,
      default: true
    },
    allow_backtrack: {
      type: Boolean,
      default: true
    },
    show_correct_answers: {
      type: Boolean,
      default: true
    },
    time_per_question: {
      type: Boolean,
      default: false
    }
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  instructor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(questions) {
        return questions.length > 0;
      },
      message: 'Quiz must have at least one question'
    }
  },
  total_questions: {
    type: Number,
    default: 0
  },
  total_points: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'suspended'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'course_only'],
    default: 'public'
  },
  access_code: {
    type: String,
    sparse: true
  },
  schedule: {
    start_date: Date,
    end_date: Date,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  statistics: {
    total_attempts: {
      type: Number,
      default: 0
    },
    completed_attempts: {
      type: Number,
      default: 0
    },
    average_score: {
      type: Number,
      default: 0
    },
    completion_rate: {
      type: Number,
      default: 0
    },
    difficulty_rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5
    },
    total_time_spent: {
      type: Number,
      default: 0 // in seconds
    }
  },
  version: {
    type: Number,
    default: 1
  },
  published_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Indexes
quizSchema.index({ instructor_id: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ difficulty_level: 1 });
quizSchema.index({ category: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ course_id: 1 });
quizSchema.index({ created_at: -1 });
quizSchema.index({ 'schedule.start_date': 1, 'schedule.end_date': 1 });

// Pre-save middleware
quizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.total_questions = this.questions.length;
    this.total_points = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  next();
});

// Methods
quizSchema.methods.isActive = function() {
  if (this.status !== 'published') return false;
  
  const now = new Date();
  if (this.schedule.start_date && now < this.schedule.start_date) return false;
  if (this.schedule.end_date && now > this.schedule.end_date) return false;
  
  return true;
};

quizSchema.methods.canUserAccess = function(user) {
  if (!this.isActive()) return false;
  
  if (this.visibility === 'private') {
    return this.instructor_id.toString() === user._id.toString();
  }
  
  if (this.visibility === 'course_only') {
    // Implement course enrollment check
    return true; // Placeholder
  }
  
  return true; // public
};

quizSchema.methods.shuffleQuestions = function() {
  if (this.settings.shuffle_questions) {
    for (let i = this.questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
    }
  }
  return this.questions;
};

quizSchema.methods.shuffleOptions = function() {
  if (this.settings.shuffle_options) {
    this.questions.forEach(question => {
      if (question.question_type === 'multiple_choice') {
        const correctOption = question.options[question.correct_answer_index];
        
        for (let i = question.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [question.options[i], question.options[j]] = [question.options[j], question.options[i]];
        }
        
        // Update correct answer index
        question.correct_answer_index = question.options.findIndex(opt => 
          opt.text === correctOption.text && opt.is_correct === correctOption.is_correct
        );
      }
    });
  }
  return this;
};

quizSchema.methods.updateStatistics = function(attempt) {
  this.statistics.total_attempts += 1;
  
  if (attempt.status === 'completed') {
    this.statistics.completed_attempts += 1;
    
    // Update average score
    const totalScore = (this.statistics.average_score * (this.statistics.completed_attempts - 1)) + attempt.score_percentage;
    this.statistics.average_score = totalScore / this.statistics.completed_attempts;
    
    // Update completion rate
    this.statistics.completion_rate = (this.statistics.completed_attempts / this.statistics.total_attempts) * 100;
    
    // Add time spent
    if (attempt.time_taken) {
      this.statistics.total_time_spent += attempt.time_taken;
    }
  }
  
  return this.save();
};

// Generate access code
quizSchema.methods.generateAccessCode = function() {
  const crypto = require('crypto');
  this.access_code = crypto.randomBytes(4).toString('hex').toUpperCase();
  return this.access_code;
};

// Static methods
quizSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published',
    $or: [
      { 'schedule.start_date': { $lte: new Date() } },
      { 'schedule.start_date': { $exists: false } }
    ],
    $or: [
      { 'schedule.end_date': { $gte: new Date() } },
      { 'schedule.end_date': { $exists: false } }
    ]
  });
};

quizSchema.statics.findByInstructor = function(instructorId, filters = {}) {
  return this.find({ 
    instructor_id: instructorId,
    ...filters
  }).populate('course_id', 'title');
};

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;