// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✅ Authenticate user using JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    if (user.role === 'instructor' && !user.isApproved) {
      return res.status(403).json({ message: 'Instructor account not approved.' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      isApproved: user.isApproved,
      is_active: user.is_active
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// ✅ Role-based access middleware
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

// ✅ Shortcuts
export const requireAdmin = authorizeRoles('admin');
export const requireInstructor = authorizeRoles('instructor', 'admin');
export const requireStudent = authorizeRoles('student', 'instructor', 'admin');

// ✅ Optional auth (e.g. for public routes)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');

      if (user && user.is_active) {
        req.user = {
          id: user._id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          isApproved: user.isApproved,
          is_active: user.is_active
        };
      }
    }
    next();
  } catch (error) {
    // Ignore token errors if optional
    next();
  }
};