// client/src/components/NavbarStudent.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavbarStudent = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">EduTalks</h1>
      <div className="space-x-4 text-sm">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/quizzes">Quizzes</Link>
        <Link to="/pronunciation">Pronunciation</Link>
        <Link to="/daily-topics">Daily Topics</Link>
        <Link to="/subscriptions">Subscriptions</Link>
        {/* <Link to="/my-courses">My Courses</Link> */}
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} className="text-red-500 ml-4 hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarStudent;
