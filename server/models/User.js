// server/models/User.js
import mongoose from 'mongoose';

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
    // Not required because Google users don't have passwords
    validate: {
      validator: function(password) {
        // Only validate password if it's being set (not for Google users)
        if (!password && !this.googleId) {
          return false;
        }
        if (password) {
          return password.length >= 8;
        }
        return true;
      },
      message: 'Password must be at least 8 characters long'
    }
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Auto-approve students and admins, but not instructors
      return this.role !== 'instructor';
    }
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
    unique: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  // For instructors
  expertise: [{
    type: String,
    trim: true
  }],
  // For tracking
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

// Pre-save middleware to ensure data consistency
userSchema.pre('save', function(next) {
  // Ensure either password or googleId exists
  if (!this.password && !this.googleId) {
    next(new Error('User must have either a password or Google ID'));
  }
  
  // Auto-set approval based on role
  if (this.isNew || this.isModified('role')) {
    this.isApproved = this.role !== 'instructor';
  }
  
  next();
});

// Instance method to check if user can login
userSchema.methods.canLogin = function() {
  if (!this.isActive) return false;
  if (this.role === 'instructor' && !this.isApproved) return false;
  return true;
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role });
};

// Static method to find pending instructors
userSchema.statics.findPendingInstructors = function() {
  return this.find({ role: 'instructor', isApproved: false });
};

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.fullName || this.email.split('@')[0];
});

const User = mongoose.model('User', userSchema);

export default User;