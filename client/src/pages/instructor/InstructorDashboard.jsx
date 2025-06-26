// client/src/pages/InstructorDashboard.jsx
import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('course');
  const [course, setCourse] = useState({ title: '', category: '', description: '' });
  const [quiz, setQuiz] = useState({ title: '', difficulty: '', question: '' });
  const [topic, setTopic] = useState({ category: '', text: '' });
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ courses: 0, quizzes: 0, topics: 0 });

  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const submitForm = async (type) => {
    try {
      const payload =
        type === 'course' ? course : type === 'quiz' ? quiz : topic;
      const endpoint =
        type === 'course'
          ? '/instructor/add-course'
          : type === 'quiz'
          ? '/instructor/add-quiz'
          : '/instructor/add-topic';

      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccess(`${type} added successfully`);
      fetchStats();
    } catch (err) {
      alert(`Failed to add ${type}`);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/instructor/stats');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <NavbarInstructor />

      <nav className="bg-white p-4 shadow flex justify-between items-center mb-6 rounded-xl">
        <h1 className="text-xl font-bold text-blue-700">👨‍🏫 Instructor Dashboard</h1>
        <div className="space-x-4">
          {['course', 'quiz', 'topic'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'course' ? 'Add Course' : tab === 'quiz' ? 'Add Quiz' : 'Add Topic'}
            </button>
          ))}
        </div>
      </nav>

      {success && (
        <div className="text-center text-green-700 font-medium mb-4 bg-green-100 py-2 rounded">
          ✅ {success}
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-10">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">📊 Your Contributions</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Forms */}
      {activeTab === 'course' && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">📘 Add New Course</h2>
          <input name="title" value={course.title} onChange={(e) => handleInput(e, setCourse)} placeholder="Course Title" className="w-full border px-4 py-2 rounded" />
          <input name="category" value={course.category} onChange={(e) => handleInput(e, setCourse)} placeholder="Category" className="w-full border px-4 py-2 rounded" />
          <textarea name="description" value={course.description} onChange={(e) => handleInput(e, setCourse)} placeholder="Description" className="w-full border px-4 py-2 rounded" />
          <button onClick={() => submitForm('course')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Course</button>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">🧠 Add New Quiz</h2>
          <input name="title" value={quiz.title} onChange={(e) => handleInput(e, setQuiz)} placeholder="Quiz Title" className="w-full border px-4 py-2 rounded" />
          <input name="difficulty" value={quiz.difficulty} onChange={(e) => handleInput(e, setQuiz)} placeholder="Difficulty (easy/medium/hard)" className="w-full border px-4 py-2 rounded" />
          <textarea name="question" value={quiz.question} onChange={(e) => handleInput(e, setQuiz)} placeholder="Question" className="w-full border px-4 py-2 rounded" />
          <button onClick={() => submitForm('quiz')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Quiz</button>
        </div>
      )}

      {activeTab === 'topic' && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-lg font-semibold text-blue-700">📅 Add Daily Topic</h2>
          <input name="category" value={topic.category} onChange={(e) => handleInput(e, setTopic)} placeholder="Category (e.g. Work, Tech)" className="w-full border px-4 py-2 rounded" />
          <textarea name="text" value={topic.text} onChange={(e) => handleInput(e, setTopic)} placeholder="Topic Description" className="w-full border px-4 py-2 rounded" />
          <button onClick={() => submitForm('topic')} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Topic</button>
        </div>
      )}

      {/* Course List */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">📚 Your Courses</h2>
        <CourseList />
      </div>
    </div>
  );
};

export default InstructorDashboard;
