// models/QuizAttempt.js
import mongoose from 'mongoose';


const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  question_text: String,
  selected_option: Number,
  selected_text: String,
  user_answer: String, // For fill-in-the-blank questions
  is_correct: {
    type: Boolean,
    default: false
  },
  points_awarded: {
    type: Number,
    default: 0
  },
  time_taken: {
    type: Number,
    default: 0 // seconds
  },
  flagged: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attempt_number: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'submitted', 'abandoned', 'timed_out'],
    default: 'in_progress'
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  score_percentage: {
    type: Number,
    default: 0
  },
  total_questions: {
    type: Number,
    default: 0
  },
  questions_answered: {
    type: Number,
    default: 0
  },
  correct_answers: {
    type: Number,
    default: 0
  },
  incorrect_answers: {
    type: Number,
    default: 0
  },
  skipped_questions: {
    type: Number,
    default: 0
  },
  time_started: {
    type: Date,
    default: Date.now
  },
  time_submitted: Date,
  time_taken: {
    type: Number,
    default: 0 // in seconds
  },
  time_limit: {
    type: Number // in seconds
  },
  remaining_time: Number,
  session_data: {
    ip_address: String,
    user_agent: String,
    browser: String,
    device: String,
    violations: [{
      type: {
        type: String,
        enum: ['tab_switch', 'window_blur', 'right_click', 'copy_paste', 'developer_tools']
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: String
    }],
    screenshots: [String] // URLs to screenshots if enabled
  },
  review_data: {
    questions_reviewed: [Number],
    time_spent_reviewing: {
      type: Number,
      default: 0
    },
    reviewed_at: Date
  },
  feedback: {
    difficulty_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    content_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    would_recommend: Boolean
  },
  grading: {
    auto_graded: {
      type: Boolean,
      default: true
    },
    manual_grading_required: {
      type: Boolean,
      default: false
    },
    graded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    graded_at: Date,
    grader_comments: String
  },
  is_passed: {
    type: Boolean,
    default: false
  },
  certificate_issued: {
    type: Boolean,
    default: false
  },
  certificate_url: String,
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
quizAttemptSchema.index({ quiz_id: 1, student_id: 1 });
quizAttemptSchema.index({ student_id: 1 });
quizAttemptSchema.index({ quiz_id: 1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ created_at: -1 });
quizAttemptSchema.index({ time_started: 1 });

// Pre-save middleware
quizAttemptSchema.pre('save', function(next) {
  // Calculate time taken if completed
  if (this.status === 'completed' && this.time_started && !this.time_taken) {
    this.time_taken = Math.floor((Date.now() - this.time_started.getTime()) / 1000);
  }
  
  // Calculate scores and statistics
  if (this.answers && this.answers.length > 0) {
    this.total_questions = this.answers.length;
    this.correct_answers = this.answers.filter(answer => answer.is_correct).length;
    this.incorrect_answers = this.answers.filter(answer => !answer.is_correct && answer.selected_option !== undefined).length;
    this.skipped_questions = this.answers.filter(answer => answer.selected_option === undefined && !answer.user_answer).length;
    this.questions_answered = this.correct_answers + this.incorrect_answers;
    
    // Calculate total score
    this.score = this.answers.reduce((total, answer) => total + (answer.points_awarded || 0), 0);
    
    // Calculate percentage (assuming total possible points)
    const totalPossiblePoints = this.answers.reduce((total, answer) => {
      // Assuming each question has default 1 point if not specified
      return total + (answer.points_awarded || 1);
    }, 0);
    
    if (totalPossiblePoints > 0) {
      this.score_percentage = Math.round((this.score / totalPossiblePoints) * 100);
    }
  }
  
  // Update submission time if status changed to completed/submitted
  if ((this.status === 'completed' || this.status === 'submitted') && !this.time_submitted) {
    this.time_submitted = new Date();
  }
  
  next();
});

// Virtual for pass/fail status
quizAttemptSchema.virtual('pass_status').get(function() {
  return this.is_passed ? 'PASSED' : 'FAILED';
});

// Method to check if attempt is expired
quizAttemptSchema.methods.isExpired = function() {
  if (!this.time_limit || !this.time_started) return false;
  const elapsedTime = Math.floor((Date.now() - this.time_started.getTime()) / 1000);
  return elapsedTime > this.time_limit;
};

// Method to get remaining time
quizAttemptSchema.methods.getRemainingTime = function() {
  if (!this.time_limit || !this.time_started) return null;
  const elapsedTime = Math.floor((Date.now() - this.time_started.getTime()) / 1000);
  const remaining = this.time_limit - elapsedTime;
  return Math.max(0, remaining);
};

// Method to calculate grade
quizAttemptSchema.methods.calculateGrade = function(passingScore = 60) {
  if (this.score_percentage >= passingScore) {
    this.is_passed = true;
    return 'PASSED';
  } else {
    this.is_passed = false;
    return 'FAILED';
  }
};

// Method to add violation
quizAttemptSchema.methods.addViolation = function(type, details = '') {
  if (!this.session_data) {
    this.session_data = { violations: [] };
  }
  if (!this.session_data.violations) {
    this.session_data.violations = [];
  }
  
  this.session_data.violations.push({
    type: type,
    timestamp: new Date(),
    details: details
  });
};

// Static method to find attempts by student
quizAttemptSchema.statics.findByStudent = function(studentId, options = {}) {
  let query = this.find({ student_id: studentId });
  
  if (options.quizId) {
    query = query.where({ quiz_id: options.quizId });
  }
  
  if (options.status) {
    query = query.where({ status: options.status });
  }
  
  if (options.populate) {
    query = query.populate('quiz_id', 'title difficulty_level');
  }
  
  return query.sort({ created_at: -1 });
};

// Static method to find attempts by quiz
quizAttemptSchema.statics.findByQuiz = function(quizId, options = {}) {
  let query = this.find({ quiz_id: quizId });
  
  if (options.status) {
    query = query.where({ status: options.status });
  }
  
  if (options.populate) {
    query = query.populate('student_id', 'name email');
  }
  
  return query.sort({ created_at: -1 });
};

// Static method to get quiz statistics
quizAttemptSchema.statics.getQuizStats = async function(quizId) {
  const stats = await this.aggregate([
    { $match: { quiz_id: mongoose.Types.ObjectId(quizId), status: { $in: ['completed', 'submitted'] } } },
    {
      $group: {
        _id: null,
        total_attempts: { $sum: 1 },
        avg_score: { $avg: '$score_percentage' },
        max_score: { $max: '$score_percentage' },
        min_score: { $min: '$score_percentage' },
        passed_count: {
          $sum: {
            $cond: [{ $eq: ['$is_passed', true] }, 1, 0]
          }
        },
        avg_time_taken: { $avg: '$time_taken' }
      }
    }
  ]);
  
  return stats[0] || {
    total_attempts: 0,
    avg_score: 0,
    max_score: 0,
    min_score: 0,
    passed_count: 0,
    avg_time_taken: 0
  };
};

// Static method to get student performance
quizAttemptSchema.statics.getStudentPerformance = async function(studentId) {
  return await this.aggregate([
    { $match: { student_id: mongoose.Types.ObjectId(studentId), status: { $in: ['completed', 'submitted'] } } },
    {
      $group: {
        _id: null,
        total_quizzes: { $sum: 1 },
        avg_score: { $avg: '$score_percentage' },
        total_time_spent: { $sum: '$time_taken' },
        quizzes_passed: {
          $sum: {
            $cond: [{ $eq: ['$is_passed', true] }, 1, 0]
          }
        }
      }
    }
  ]);
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;