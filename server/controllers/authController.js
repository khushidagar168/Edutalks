// server/controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  return minLength && hasUpperCase && hasLowerCase && hasNumbers;
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName || user.name,
  role: user.role,
  isApproved: user.isApproved,
  googleId: user.googleId || null,
  createdAt: user.createdAt
});

// Regular Registration
export const register = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  
  try {
    // Input validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (fullName.length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({ 
      fullName: fullName.trim(),
      email: email.toLowerCase(), 
      password: password,
      role: role || 'student',
      isApproved: role === 'instructor' ? false : true // Instructors need approval
    });
    
    await user.save();

    res.status(201).json({ 
      message: role === 'instructor' 
        ? 'Registration successful! Your instructor account is pending admin approval.' 
        : 'Registration successful! Please login to continue.',
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

// Regular Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check instructor approval
    if (user.role === 'instructor' && !user.isApproved) {
      return res.status(403).json({ message: 'Instructor not approved by admin yet' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

export const googleLogin = async (req, res) => {
  const { email, name, googleId, requestedRole } = req.body;
  
  try {
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Email and Google ID are required' });
    }

    // Find user by email or googleId
    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // Validate role mismatch
    if (requestedRole && user.role !== requestedRole) {
      return res.status(400).json({ 
        message: `Account exists with role '${user.role}'. Cannot login as '${requestedRole}'.` 
      });
    }

    // Check instructor approval
    if (user.role === 'instructor' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'Your instructor account is pending admin approval. Please wait for approval.' 
      });
    }

    // Update googleId if not set (for users who initially registered with email/password)
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(200).json({ 
      message: 'Google login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Google login failed. Please try again.' });
  }
};

// BACKEND - Improved Google Registration
export const googleRegister = async (req, res) => {
  const { fullName, email, googleId, role } = req.body;
  
  try {
    if (!fullName || !email || !googleId) {
      return res.status(400).json({ message: 'Name, email, and Google ID are required' });
    }

    // Validate role
    const allowedRoles = ['student', 'instructor', 'tutor'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Prevent admin registration via Google
    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be created via Google authentication' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user already exists
    const existing = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (existing) {
      return res.status(400).json({ 
        message: `Account already exists with role '${existing.role}'. Please login instead.` 
      });
    }

    // Create user
    const user = new User({ 
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      googleId: googleId,
      role: role || 'student',
      isApproved: role === 'instructor' ? false : true, // Instructors need approval
      createdAt: new Date(),
      lastLogin: new Date(),
      // No password for Google users
    });
    
    await user.save();

    // Generate token (even for unapproved instructors, but they'll have limited access)
    const token = generateToken(user);

    // Different messages based on role
    let message = 'Registration successful!';
    if (role === 'instructor') {
      message = 'Registration successful! Your instructor account is pending admin approval.';
    }

    res.status(201).json({ 
      message,
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Google registration error:', err);
    res.status(500).json({ message: 'Google registration failed. Please try again.' });
  }
};

// Logout (optional - mainly for token blacklisting if implemented)
export const logout = async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // But you can implement token blacklisting here if needed
  res.status(200).json({ message: 'Logout successful' });
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  const { fullName, email } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate input
    if (fullName && fullName.length < 2) {
      return res.status(400).json({ message: 'Full name must be at least 2 characters' });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if email is already taken (by another user)
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: user._id }
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
    }

    // Update user
    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.toLowerCase();
    
    await user.save();

    res.status(200).json({ 
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Cannot change password for Google users' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters with uppercase, lowercase, and numbers' 
      });
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Failed to change password' });
  }
};