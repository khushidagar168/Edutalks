import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../services/axios';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
  Users,
  Shield,
  BookOpen,
  ChevronDown,
  X,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import NavbarLanding from '../components/NavbarLanding';

// Toast Notification Component
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

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [useMobile, setUseMobile] = useState(false); // Toggle between email/mobile
  const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent
  const [otp, setOtp] = useState(''); // Store OTP input
  const [resendTimer, setResendTimer] = useState(0); // Resend OTP timer

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  // Show toast notification
  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };
  useEffect(() => {
    // Clear stale auth data on mount
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    // Reset form and errors when switching between login/register
    setForm({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', role: 'student' });
    setErrors({});
    setUseMobile(false);
    setOtpSent(false);
    setOtp('');
    hideToast();
  }, [isLogin]);

  // Handle resend OTP timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10,15}$/;
    return mobileRegex.test(mobile);
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

  const validateForm = () => {
    const newErrors = {};

    // Validate based on authentication method
    if (form.role === 'student' && useMobile) {
      if (!form.mobile) {
        newErrors.mobile = 'Mobile number is required';
      } else if (!validateMobile(form.mobile)) {
        newErrors.mobile = 'Please enter a valid mobile number';
      }
    } else {
      if (!form.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(form.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!isLogin || !useMobile || !otpSent) {
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (!isLogin && !validatePassword(form.password)) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and numbers';
      }
    }

    if (!isLogin && canRegister) {
      if (!form.fullName) {
        newErrors.fullName = 'Full name is required';
      } else if (form.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }

      if (!form.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (otpSent && !otp) {
      newErrors.otp = 'OTP is required';
    } else if (otpSent && otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time password validation for registration
    if (name === 'password' && !isLogin) {
      validatePassword(value);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setOtp(value);
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const sendOtp = async () => {
    if (!form.mobile) {
      showToast('Mobile number is required', 'error');
      return;
    }

    if (!validateMobile(form.mobile)) {
      showToast('Please enter a valid mobile number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Call your backend API to send OTP
      await axios.post('/auth/send-mobile-otp', {
        mobile: form.mobile,
        isLogin,
        role: form.role
      });

      setOtpSent(true);
      setResendTimer(60); // 60 seconds timer
      showToast('OTP sent successfully!', 'success');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtp();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = Object.values(errors)[0];
      showToast(firstError, 'error');
      return;
    }

    setIsLoading(true);
    setErrors({});
    hideToast();

    try {
      if (isLogin) {
        if (form.role === 'student' && useMobile && otpSent) {
          // Mobile OTP login
          const response = await axios.post('/auth/login-mobile', {
            mobile: form.mobile,
            otp,
            role: form.role,
          });
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          showToast('Login successful!', 'success');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          // Email login
          const response = await axios.post('/auth/login', {
            email: form.email,
            password: form.password,
            role: form.role,
          });
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          setUser(user);
          showToast('Login successful!', 'success');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } else {
        // Registration
        if (form.role === 'student' && useMobile && otpSent) {
          // Mobile registration
          await axios.post('/auth/register-mobile', {
            fullName: form.fullName,
            mobile: form.mobile,
            password: form.password,
            otp,
            role: form.role,
          });
          showToast('Registration successful! Please login to continue.', 'success');
          setTimeout(() => setIsLogin(true), 2000);
        } else {
          // Email registration
          await axios.post('/auth/register', {
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            role: form.role,
          });
          showToast('Registration successful! Please login to continue.', 'success');
          setTimeout(() => setIsLogin(true), 2000);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (keep your existing handleGoogleAuth, getDashboardPath, getPasswordStrengthColor, getPasswordStrengthText functions)
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    hideToast();

    // Prevent Google auth for admin role in registration mode
    if (!isLogin && form.role === 'admin') {
      showToast('Admin accounts cannot be created via Google authentication.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Try to login first
      try {
        const loginResponse = await axios.post('/auth/google-login', {
          email: user.email,
          name: user.displayName,
          googleId: user.uid,
          requestedRole: form.role, // Pass as requestedRole for validation
        });
        const { token, user: userData } = loginResponse.data;

        // Store auth data (in your real app, not in Claude artifacts)
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        showToast('Google login successful!', 'success');

        // Navigate based on role
        // const redirectPath = location.state?.from?.pathname || getDashboardPath(userData.role);
        setTimeout(() => navigate('/dashboard'), 1000);

      } catch (loginError) {
        // If login fails, try to register (only for non-admin roles)
        if (loginError.response?.status === 404 && form.role !== 'admin') {
          try {
            const registerResponse = await axios.post('/auth/google-register', {
              fullName: user.displayName,
              email: user.email,
              googleId: user.uid,
              role: form.role,
            });

            const { token, user: userData, message } = registerResponse.data;

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(user);
            showToast(message, 'success');

            // Handle instructor approval case
            if (userData.role === 'instructor' && !userData.isApproved) {
              showToast('Your instructor account is pending admin approval. You will be notified once approved.', 'info');
              // Maybe redirect to a pending approval page
            } else {
              setTimeout(() => navigate(getDashboardPath(userData.role)), 1000);
            }
          } catch (registerError) {
            const errorMessage = registerError.response?.data?.message || 'Google registration failed. Please try again.';
            showToast(errorMessage, 'error');
          }
        } else if (loginError.response?.status === 403) {
          // Handle instructor not approved case
          showToast(loginError.response.data.message, 'error');
        } else {
          const errorMessage = loginError.response?.data?.message || 'Google authentication failed. Please try again.';
          showToast(errorMessage, 'error');
        }
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      showToast('Google authentication failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      default: return '/dashboard';
    }
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
  const roleOptions = [
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      description: 'Learn from expert instructors',
      color: 'text-blue-600'
    },
    {
      value: 'instructor',
      label: 'Instructor',
      icon: BookOpen,
      description: 'Teach and share knowledge',
      color: 'text-purple-600'
    },
    ...(isLogin ? [{
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Manage platform operations',
      color: 'text-emerald-600'
    }] : []),
  ];

  const selectedRole = roleOptions.find(option => option.value === form.role);

  // Check if user can register based on role selection
  const canRegister = form.role !== 'admin';

  // Check if mobile login is allowed (only for students)
  const canUseMobile = form.role === 'student';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <NavbarLanding />
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={hideToast}
      />

      <div className="w-full max-w-md mt-[50px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to EduTalks
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Admin Login Only Notice */}
            {form.role === 'admin' && !isLogin && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-amber-800 text-sm">
                    Admin accounts can only login. Registration is not available for admin role.
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="ml-2 font-medium underline hover:no-underline"
                    >
                      Switch to login
                    </button>
                  </span>
                </div>
              </div>
            )}

            {/* Full Name (Register only and not admin) */}
            {!isLogin && canRegister && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-600 text-sm">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Authentication Method Toggle (Only for students) */}
            {canUseMobile && (
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setUseMobile(false)}
                  className={`px-4 py-2 rounded-lg flex items-center ${!useMobile ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setUseMobile(true)}
                  className={`px-4 py-2 rounded-lg flex items-center ${useMobile ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </button>
              </div>
            )}

            {/* Email or Mobile Input */}
            {!useMobile ? (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email}</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.mobile ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your mobile number"
                    maxLength="15"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-600 text-sm">{errors.mobile}</p>
                )}
                {!otpSent && form.mobile && (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isLoading}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-1" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Send OTP
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* OTP Input (Only for mobile login/register) */}
            {otpSent && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">OTP</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={handleOtpChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.otp ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-600 text-sm">{errors.otp}</p>
                )}
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Didn't receive OTP?"}
                  </span>
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={resendTimer > 0}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}

            {/* Password (Not needed for OTP login) */}
            {(!isLogin || !useMobile || !otpSent) && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm">{errors.password}</p>
                )}

                {/* Password Strength Indicator (Register only and not admin) */}
                {!isLogin && canRegister && form.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Register only and not admin) */}
            {!isLogin && canRegister && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Role Selection Dropdown */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">I am a:</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <div className="flex items-center">
                    <selectedRole.icon className={`h-5 w-5 mr-3 ${selectedRole.color}`} />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{selectedRole.label}</div>
                      <div className="text-sm text-gray-500">{selectedRole.description}</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, role: option.value }));
                          setIsRoleDropdownOpen(false);
                          // Reset mobile auth if switching to non-student role
                          if (option.value !== 'student') {
                            setUseMobile(false);
                            setOtpSent(false);
                          }
                        }}
                        className={`w-full flex items-center p-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${form.role === option.value ? 'bg-blue-50' : ''
                          }`}
                      >
                        <option.icon className={`h-5 w-5 mr-3 ${option.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || (!isLogin && !canRegister)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FcGoogle className="h-5 w-5 mr-2" />
            Continue with Google
          </button>

          {/* Toggle Auth Mode */}
          {(isLogin || canRegister) && (
            <div className="mt-6 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="text-sm text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>

              <div>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
