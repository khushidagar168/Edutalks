// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (optional - for fresh user data)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if instructor is approved
    if (user.role === 'instructor' && !user.isApproved) {
      return res.status(403).json({ message: 'Instructor account not approved' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isApproved: user.isApproved
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Middleware to check user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware specifically for admin routes
export const requireAdmin = authorizeRoles('admin');

// Middleware specifically for instructor routes
export const requireInstructor = authorizeRoles('instructor', 'admin');

// Middleware for student routes
export const requireStudent = authorizeRoles('student', 'instructor', 'admin');