// client/src/components/NavbarAdmin.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavbarAdmin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-red-600">EduTalks - Admin</h1>
      <div className="space-x-4 text-sm">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin/courses">Courses</Link>
        <Link to="/admin/quizzes">Quizzes</Link>
        <Link to="/admin/topics">Topics</Link>
        <Link to="/admin/paragraphs">Paragraphs</Link>
        <Link to="/admin-coupons">Coupons</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} className="text-red-500 ml-4 hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
