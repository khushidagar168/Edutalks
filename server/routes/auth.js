// server/routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  googleLogin,
  googleRegister,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  resendOTP,
  sendMobileOTP,
  verifyMobileOTP,
  registerWithMobile,
  loginWithMobile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/google-register', googleRegister);
router.post('/logout', logout);



// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);


router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);


// Mobile authentication routes
router.post('/send-mobile-otp', sendMobileOTP);
router.post('/verify-mobile-otp', verifyMobileOTP);
router.post('/register-mobile', registerWithMobile);
router.post('/login-mobile', loginWithMobile);

export default router;