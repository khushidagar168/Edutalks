import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield } from 'react-icons/fa';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({ fullName: '', email: '', password: '', role: 'student' });
    setError('');
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post('/auth/login', {
          email: form.email,
          password: form.password,
          role: form.role,
        });

        const { token, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'instructor') navigate('/instructor/dashboard');
        else navigate('/dashboard');
      } else {
        await axios.post('/auth/register', form);
        alert('Registered! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      try {
        const res = await axios.post('/auth/login', {
          email: user.email,
          password: '',
          role: 'student',
        });
        const { token, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        navigate('/dashboard');
      } catch (loginErr) {
        await axios.post('/auth/register', {
          fullName: user.displayName,
          email: user.email,
          password: '',
          role: 'student',
        });

        const res = await axios.post('/auth/login', {
          email: user.email,
          password: '',
          role: 'student',
        });
        const { token, role } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      setError('Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          {isLogin ? '🔐 Login to EduTalks' : '📝 Register for EduTalks'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="fullName"
              placeholder="👤 Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border px-4 py-2 rounded-lg focus:outline-blue-500"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="📧 Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded-lg focus:outline-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="🔒 Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border px-4 py-2 rounded-lg focus:outline-blue-500"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg text-gray-700 bg-white"
          >
            <option value="student">🎓 Student</option>
            <option value="instructor">👨‍🏫 Instructor</option>
            <option value="admin">🛡️ Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg hover:shadow-md transition"
        >
          <FcGoogle className="text-xl" />
          <span className="text-gray-700 font-medium">Continue with Google</span>
        </button>

        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={toggleMode} className="text-blue-600 hover:underline font-semibold">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
