import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    validate: {
      validator: function(password) {
        if (!password && !this.googleId) return false;
        if (password) return password.length >= 8;
        return true;
      },
      message: 'Password must be at least 8 characters long'
    }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  isApproved: {
    type: Boolean,
    default: function () {
      return this.role !== 'instructor';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  location: {
    type: String,
    maxlength: 100
  },
  institution: {
    type: String,
    maxlength: 100
  },
  department: {
    type: String,
    maxlength: 100
  },
  preferences: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    quiz_reminders: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  stats: {
    quizzes_created: { type: Number, default: 0 },
    quizzes_taken: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 },
    average_score: { type: Number, default: 0 },
    badges: [{
      name: String,
      earned_at: {
        type: Date,
        default: Date.now
      }
    }]
  },
  verification: {
    email_verified: { type: Boolean, default: false },
    email_verification_token: String,
    email_verification_expires: Date,
    password_reset_token: String,
    password_reset_expires: Date
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.verification?.password_reset_token;
      delete ret.verification?.email_verification_token;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'verification.email_verification_token': 1 });
userSchema.index({ 'verification.password_reset_token': 1 });

// Pre-save password hash
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Ensure password or Google ID exists
userSchema.pre('save', function (next) {
  if (!this.password && !this.googleId) {
    return next(new Error('User must have either a password or Google ID'));
  }

  if (this.isNew || this.isModified('role')) {
    this.isApproved = this.role !== 'instructor';
  }

  next();
});

// Instance methods

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.verification.password_reset_token = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.verification.password_reset_expires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.updateStats = async function (type, value = 1) {
  switch (type) {
    case 'quiz_created':
      this.stats.quizzes_created += value;
      break;
    case 'quiz_taken':
      this.stats.quizzes_taken += value;
      break;
    case 'score_added':
      this.stats.total_score += value;
      this.stats.average_score = this.stats.total_score / this.stats.quizzes_taken;
      break;
  }
  return this.save();
};

userSchema.methods.addBadge = function (badgeName) {
  const exists = this.stats.badges.some(badge => badge.name === badgeName);
  if (!exists) {
    this.stats.badges.push({ name: badgeName });
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.canLogin = function () {
  if (!this.isActive) return false;
  if (this.role === 'instructor' && !this.isApproved) return false;
  return true;
};

// Static methods

userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

userSchema.statics.findPendingInstructors = function () {
  return this.find({ role: 'instructor', isApproved: false });
};

// Virtual
userSchema.virtual('displayName').get(function () {
  return this.fullName || this.email.split('@')[0];
});

const User = mongoose.model('User', userSchema);
export default User;