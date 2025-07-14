import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/axios';
import {
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Shield,
  X
} from 'lucide-react';

// API endpoints
const API_ENDPOINTS = {
  SEND_RESET_CODE: '/auth/forgot-password',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  RESEND_OTP: '/auth/resend-otp'
};

// Toast Component
const Toast = ({ message, type, onClose, visible }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`p-4 border rounded-lg shadow-lg flex items-center max-w-sm ${bgColor}`}>
        <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
        <span className={`text-sm flex-1 ${textColor}`}>{message}</span>
        <button
          onClick={onClose}
          className={`ml-2 ${iconColor} hover:opacity-75`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Countdown Timer Component
const CountdownTimer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center text-sm text-gray-600">
      <Clock className="h-4 w-4 mr-1" />
      {formatTime(timeLeft)}
    </div>
  );
};

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [maskedEmail, setMaskedEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    let strength = 0;
    if (minLength) strength += 1;
    if (hasUpperCase) strength += 1;
    if (hasLowerCase) strength += 1;
    if (hasNumbers) strength += 1;
    if (hasSpecialChar) strength += 1;

    setPasswordStrength(strength);
    return minLength && hasUpperCase && hasLowerCase && hasNumbers;
  };

  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.slice(0, 2) + '***' + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    hideToast();

    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.SEND_RESET_CODE, {
        email: email.toLowerCase().trim()
      });

      const { data } = response;
      
      // Store session information
      setSessionId(data.sessionId);
      setMaskedEmail(data.maskedEmail || maskEmail(email));
      
      // Set resend cooldown from server response
      const cooldown = data.resendCooldown || 60;
      setResendCooldown(cooldown);
      setCanResend(false);
      
      showToast('Reset code sent to your email!', 'success');
      setStep(2);
      
    } catch (error) {
      console.error('Send reset code error:', error);
      
      let errorMessage = 'Failed to send reset email';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Email address not found';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    hideToast();

    if (!otp) {
      setErrors({ otp: 'OTP is required' });
      return;
    }

    if (otp.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFY_OTP, {
        email: email.toLowerCase().trim(),
        otp: otp,
        sessionId: sessionId
      });

      const { data } = response;
      
      // Store the reset token for password reset
      setResetToken(data.resetToken);
      
      showToast('OTP verified successfully!', 'success');
      setStep(3);
      
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      let errorMessage = 'Invalid OTP';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid or expired OTP';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      
      // If OTP is expired, allow user to resend
      if (error.response?.status === 400 && error.response?.data?.code === 'OTP_EXPIRED') {
        setCanResend(true);
        setResendCooldown(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    hideToast();

    if (!newPassword) {
      setErrors({ newPassword: 'Password is required' });
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrors({ newPassword: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, {
        email: email.toLowerCase().trim(),
        newPassword: newPassword,
        resetToken: resetToken,
        sessionId: sessionId
      });

      showToast('Password reset successfully!', 'success');
      
      // Clear sensitive data
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setSessionId('');
      
      // Navigate to login after delay
      setTimeout(() => {
        navigate('/auth', { 
          state: { 
            message: 'Password reset successful! Please login with your new password.' 
          } 
        });
      }, 2000);
      
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid or expired reset token';
      } else if (error.response?.status === 422) {
        errorMessage = 'Password does not meet requirements';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
      
      // If token is expired, restart the process
      if (error.response?.status === 400 && error.response?.data?.code === 'TOKEN_EXPIRED') {
        setTimeout(() => {
          setStep(1);
          setEmail('');
          setOtp('');
          setResetToken('');
          setSessionId('');
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    hideToast();

    try {
      const response = await apiClient.post(API_ENDPOINTS.RESEND_OTP, {
        email: email.toLowerCase().trim(),
        sessionId: sessionId
      });

      const { data } = response;
      
      // Update session info if provided
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
      
      showToast('New OTP sent to your email!', 'success');
      
      // Reset cooldown
      const cooldown = data.resendCooldown || 60;
      setCanResend(false);
      setResendCooldown(cooldown);
      
      // Clear current OTP
      setOtp('');
      
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = 'Failed to resend OTP';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
        
        // Set cooldown from server response
        if (error.response?.data?.timeLeft) {
          setResendCooldown(error.response.data.timeLeft);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendComplete = () => {
    setCanResend(true);
    setResendCooldown(0);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (step > 1) {
        setStep(step - 1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [step]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Verify OTP'}
            {step === 3 && 'New Password'}
          </h1>
          <p className="text-gray-600">
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create a new password for your account'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit code to <strong>{maskedEmail}</strong>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-lg tracking-wider ${
                    errors.otp ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter 6-digit code"
                  disabled={isLoading}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {errors.otp && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>

              <div className="text-center">
                {!canResend && resendCooldown > 0 ? (
                  <div className="text-sm text-gray-500">
                    <CountdownTimer seconds={resendCooldown} onComplete={handleResendComplete} />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading || !canResend}
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password Strength:</span>
                      <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : passwordStrength <= 4 ? 'text-blue-600' : 'text-green-600'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 block">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center mx-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-3 h-3 rounded-full transition-colors ${
                  stepNum === step
                    ? 'bg-blue-600'
                    : stepNum < step
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;