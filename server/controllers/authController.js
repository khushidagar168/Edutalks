// server/controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Add these imports to your authController.js
import crypto from 'crypto';
import { sendOTPEmail, sendPasswordResetConfirmation } from '../services/emailservice.js';

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




// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Rate limiting helper
const checkRateLimit = (user) => {
  const now = new Date();
  const lastAttempt = user.resetPasswordLastAttempt;
  const attempts = user.resetPasswordAttempts || 0;

  // Reset attempts if last attempt was more than 1 hour ago
  if (!lastAttempt || now - lastAttempt > 60 * 60 * 1000) {
    return { allowed: true, attempts: 0 };
  }

  // Allow max 5 attempts per hour
  if (attempts >= 5) {
    const timeLeft = 60 - Math.floor((now - lastAttempt) / (60 * 1000));
    return { 
      allowed: false, 
      attempts, 
      timeLeft: timeLeft > 0 ? timeLeft : 0 
    };
  }

  return { allowed: true, attempts };
};

// Request Password Reset OTP
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with this email exists, you will receive a password reset OTP.' 
      });
    }

    // Check if user has a password (Google users can't reset password)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'This account was created with Google. Please use Google sign-in or contact support.' 
      });
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(user);
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        message: `Too many reset attempts. Please try again in ${rateLimit.timeLeft} minutes.`,
        timeLeft: rateLimit.timeLeft
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to user
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    user.resetPasswordAttempts = rateLimit.attempts + 1;
    user.resetPasswordLastAttempt = new Date();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.fullName);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.status(200).json({ 
      message: 'Password reset OTP sent to your email address.',
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
    });
  } catch (err) {
    console.error('Request password reset error:', err);
    res.status(500).json({ message: 'Failed to process password reset request. Please try again.' });
  }
};

// Verify OTP
export const verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    // Check if OTP exists and is not expired
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'No password reset request found. Please request a new OTP.' });
    }

    if (new Date() > user.resetPasswordOTPExpiry) {
      // Clean up expired OTP
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpiry = null;
      await user.save();
      
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.resetPasswordOTP !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Generate a temporary token for password reset (valid for 15 minutes)
    const resetToken = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        purpose: 'password-reset'
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.status(200).json({ 
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken,
      expiresIn: '15 minutes'
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Failed to verify OTP. Please try again.' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  
  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    // Validate new password
    if (!isValidPassword(newPassword)) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' 
      });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify that the OTP process was completed (extra security)
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'Invalid password reset session. Please start over.' });
    }

    // Hash new password
    
    // Update user password and clear reset fields
    user.password = newPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpiry = null;
    user.resetPasswordAttempts = 0;
    user.resetPasswordLastAttempt = null;
    await user.save();

    // Send confirmation email
    const emailResult = await sendPasswordResetConfirmation(user.email, user.fullName);
    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the reset if email fails
    }

    res.status(200).json({ 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password. Please try again.' });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  
  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No password reset request found for this email' });
    }

    // Check if there's an existing reset request
    if (!user.resetPasswordOTP || !user.resetPasswordOTPExpiry) {
      return res.status(400).json({ message: 'No active password reset request found. Please start over.' });
    }

    // Check rate limiting (allow resend only after 1 minute)
    const now = new Date();
    const lastAttempt = user.resetPasswordLastAttempt;
    if (lastAttempt && now - lastAttempt < 60 * 1000) {
      const timeLeft = 60 - Math.floor((now - lastAttempt) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${timeLeft} seconds before requesting a new OTP.`,
        timeLeft
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = otpExpiry;
    user.resetPasswordLastAttempt = new Date();
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.fullName);
    
    if (!emailResult.success) {
      console.error('Failed to send OTP email:', emailResult.error);
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.status(200).json({ 
      message: 'New OTP sent to your email address.',
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to resend OTP. Please try again.' });
  }
};