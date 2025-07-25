import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import 'antd/dist/reset.css'; // Make sure you import the CSS

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import Courses from './pages/Courses';
import DailyTopics from './pages/DailyTopics';
import Quizzes from './pages/Quizzes';
import Pronunciation from './pages/Pronunciation';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import NavbarAdmin from './components/NavbarAdmin';
import NavbarInstructor from './components/NavbarInstructor';
import NavbarStudent from './components/NavbarStudent';
import AdminUsers from './pages/AdminUsers';
import AddQuiz from './pages/AddQuiz';
import AddTopic from './pages/AddTopic';
import CoursesAdmin from './pages/CoursesAdmin';
import QuizzesAdmin from './pages/QuizzesAdmin';
import TopicsAdmin from './pages/TopicsAdmin';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import ForgotPassword from './pages/ResetPasswordOTP';
import CoursebyID from "./pages/CourseForStudent"
import QuizAttempt from './pages/AttemptQuiz';
import ParagraphListAdmin from './pages/admin/AdminParagraphs';
import AdminCoupons from './components/AdminCoupons';
import Subscription from './pages/Subscription';
import AdminSiteSettings from './pages/AdminSiteSettings';

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      {/* Top Navbar for Admin and Instructor */}
      {user && user.role === 'instructor' && <NavbarInstructor />}
      {user && user.role === 'admin' && <NavbarAdmin />}

      <div className="flex min-h-screen">
        {/* Sidebar for Student */}
        {user && user.role === 'student' && <NavbarStudent />}

        {/* Main Content Area */}
        <div className={`flex-1 ${user?.role === 'student' ? 'ml-0 lg:ml-64' : ''}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route
              path="/dashboard"
              element={
                user?.role === 'admin' ? (
                  <AdminDashboard />
                ) : user?.role === 'instructor' ? (
                  <InstructorDashboard />
                ) : user?.role === 'student' ? (
                  <StudentDashboard />
                )
                 : (
                  <Navigate to="/auth" />
                )
              }
            />

            <Route path="/courses" element={<Courses />} />
            <Route path="/admin/courses" element={<CoursesAdmin />} />
            <Route path="/admin/settings" element={<AdminSiteSettings />} />
            <Route path="/admin/paragraphs" element={<ParagraphListAdmin />} />
            <Route path="/courses/:id" element={<CoursebyID />} />
            <Route path="/quizzes/:id" element={<QuizAttempt />} />
            <Route path="/admin/quizzes" element={<QuizzesAdmin />} />
            <Route path="/admin/topics" element={<TopicsAdmin />} />
            <Route path="/daily-topics" element={<DailyTopics />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/pronunciation" element={<Pronunciation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscriptions" element={<Subscription />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/dashboard/add-quiz" element={<AddQuiz />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route path="/admin-coupons" element={<AdminCoupons/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;