import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const isAdminPage = user?.role === "admin"
  const isInstructorPage = user?.role === "instructor"
  const isStudentPage = user?.role === "student"

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
            (() => {
              const user = JSON.parse(localStorage.getItem('user'));
              if (user?.role === 'admin') return <AdminDashboard />;
              if (user?.role === 'instructor') return <InstructorDashboard />;
              return <StudentDashboard />;
            })()
          }
        />
        <Route path="/courses" element={<Courses />} />
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
