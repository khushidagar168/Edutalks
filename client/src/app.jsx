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
import Subscriptions from './pages/Subscriptions';
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

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <Router>
      {user?.role === 'student' && <NavbarStudent />}
      {user?.role === 'instructor' && <NavbarInstructor />}
      {user?.role === 'admin' && <NavbarAdmin />}

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
            ) : (
              <Navigate to="/auth" />
            )
          }
        />

        <Route path="/courses" element={<Courses />} />
        <Route path="/admin/courses" element={<CoursesAdmin />} />
        <Route path="/admin/quizzes" element={<QuizzesAdmin />} />
        <Route path="/admin/topics" element={<TopicsAdmin />} />
        <Route path="/daily-topics" element={<DailyTopics />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/pronunciation" element={<Pronunciation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/dashboard/add-quiz" element={<AddQuiz />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Routes>
    </Router>
  );
};

export default App;
