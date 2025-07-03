// client/src/pages/InstructorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../services/axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import CourseList from '../../components/CourseList';
import NavbarInstructor from '../../components/NavbarInstructor';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ courses: 0, quizzes: 0, topics: 0 });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/instructor/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = {
    labels: ['Courses', 'Quizzes', 'Topics'],
    datasets: [
      {
        label: 'Content Count',
        data: [stats.courses, stats.quizzes, stats.topics],
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const handleNavigation = (type) => {
    switch(type) {
      case 'course':
        navigate('/instructor/add-course');
        break;
      case 'quiz':
        navigate('/instructor/add-quiz');
        break;
      case 'topic':
        navigate('/instructor/add-topic');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <NavbarInstructor />

      <nav className="bg-white p-4 shadow flex justify-between items-center mb-6 rounded-xl">
        <h1 className="text-xl font-bold text-blue-700">👨‍🏫 Instructor Dashboard</h1>
        <div className="space-x-4">
          {[
            { key: 'course', label: 'Add Course', icon: '📘' },
            { key: 'quiz', label: 'Add Quiz', icon: '🧠' },
            { key: 'topic', label: 'Add Topic', icon: '📅' }
          ].map((item) => (
            <button
              key={item.key}
              className="px-6 py-3 rounded-lg transition font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105"
              onClick={() => handleNavigation(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">📊 Your Contributions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.courses}</div>
            <div className="text-sm text-gray-600">Courses Created</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.quizzes}</div>
            <div className="text-sm text-gray-600">Quizzes Created</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.topics}</div>
            <div className="text-sm text-gray-600">Topics Added</div>
          </div>
        </div>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Course List */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">📚 Your Courses</h2>
        <CourseList />
      </div>
    </div>
  );
};

export default InstructorDashboard;