import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // ✅ Import Toaster

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import DailyTopics from './pages/DailyTopics';
import Quizzes from './pages/Quizzes';
import Pronunciation from './pages/Pronunciation';
import Profile from './pages/Profile';
import Subscriptions from './pages/Subscriptions';
import MyCourses from './pages/MyCourses';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import AdminUsers from './pages/AdminUsers';
import AddCourse from './pages/AddCourse';
import AddQuiz from './pages/AddQuiz';
import AddTopic from './pages/AddTopic';


const App = () => {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Add toaster here */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={(() => {
            const role = localStorage.getItem('role');
            if (role === 'admin') return <AdminDashboard />;
            if (role === 'instructor') return <InstructorDashboard />;
            return <Dashboard />;
          })()}
        />
        <Route path="/courses" element={<Courses />} />
        <Route path="/daily-topics" element={<DailyTopics />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/pronunciation" element={<Pronunciation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/instructor/add-course" element={<AddCourse />} />
        <Route path="/instructor/add-quiz" element={<AddQuiz />} />
        <Route path="/instructor/add-topic" element={<AddTopic />} />
        
      </Routes>
    </Router>
  );
};

export default App;
