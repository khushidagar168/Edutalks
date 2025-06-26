import React from 'react';
import NavbarStudent from '../components/NavbarStudent';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <NavbarStudent />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <h2 className="text-4xl font-extrabold text-indigo-800 mb-12 text-center">
          🎓 Welcome to <span className="text-indigo-600">EduTalks</span>
        </h2>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              to: '/daily-topics',
              title: "🗣️ Today's Topic",
              desc: 'Practice daily conversations',
              color: 'border-indigo-400',
            },
            {
              to: '/quizzes',
              title: '🧠 Take a Quiz',
              desc: 'Challenge your understanding',
              color: 'border-yellow-400',
            },
            {
              to: '/pronunciation',
              title: '🎤 Practice Pronunciation',
              desc: 'AI-powered voice evaluation',
              color: 'border-pink-400',
            },
          ].map(({ to, title, desc, color }, i) => (
            <Link
              key={i}
              to={to}
              className={`bg-white border-l-4 ${color} p-6 rounded-xl shadow hover:shadow-lg transition duration-300`}
            >
              <h3 className="text-xl font-semibold mb-2 text-indigo-700">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </Link>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow border-l-4 border-green-400">
          <h3 className="text-2xl font-semibold text-green-700 mb-4">📈 Your Learning Progress</h3>
          <p className="text-gray-600 text-sm">
            Here's a sneak peek at your learning journey. Dive deeper every day to level up!
          </p>

          <div className="mt-6 w-full h-40 bg-gray-50 border rounded-lg flex items-center justify-center text-gray-400 text-sm">
            🚧 Progress visualization coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
