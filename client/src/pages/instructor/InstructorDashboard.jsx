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
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: null,
    pdf: null
  });
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ courses: 0, quizzes: 0, topics: 0 });
  const navigate = useNavigate();

  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleFileChange = (e, field) => {
    setCourse(prev => ({ ...prev, [field]: e.target.files[0] }));
  };
  const user = JSON.parse(localStorage.getItem('user'))
  const submitCourse = async () => {
    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('description', course.description);
      formData.append('price', course.price);
      formData.append('category', course.category);
      formData.append('owner_id', user.id);
      if (course.image) formData.append('image', course.image);
      if (course.pdf) formData.append('pdf', course.pdf);

      await axios.post('/courses/add', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Course added successfully');
      setShowCourseModal(false);
      setCourse({
        title: '',
        description: '',
        price: 0,
        category: '',
        image: null,
        pdf: null
      });
      fetchStats();
    } catch (err) {
      alert('Failed to add course');
      console.error(err);
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
    <div className="min-h-screen bg-gray-50 p-4">

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Instructor Dashboard</h1>
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Add Course
          </button>
          <button
            onClick={() => navigate('./add-quiz')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            + Add Quiz
          </button>

        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 font-medium">Total Courses</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.courses}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 font-medium">Total Quizzes</h3>
            <p className="text-3xl font-bold text-amber-500">{stats.quizzes}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 font-medium">Total Topics</h3>
            <p className="text-3xl font-bold text-emerald-500">{stats.topics}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Contributions</h2>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Your Courses</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-gray-100 rounded-lg">Filter</button>
              <button className="px-4 py-2 bg-gray-100 rounded-lg">Sort</button>
            </div>
          </div>
          <CourseList />
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Create New Course</h2>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Course Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={course.title}
                    onChange={(e) => handleInput(e, setCourse)}
                    placeholder="e.g. Advanced React Development"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={course.description}
                    onChange={(e) => handleInput(e, setCourse)}
                    placeholder="Describe what students will learn in this course"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Price ($)*</label>
                    <input
                      type="number"
                      name="price"
                      value={course.price}
                      onChange={(e) => handleInput(e, setCourse)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Category*</label>
                    <input
                      type="text"
                      name="category"
                      value={course.category}
                      onChange={(e) => handleInput(e, setCourse)}
                      placeholder="e.g. Web Development"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Course Image</label>
                    <div className="border border-gray-300 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                      {course.image && (
                        <p className="mt-2 text-sm text-gray-600">{course.image.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Course PDF</label>
                    <div className="border border-gray-300 border-dashed rounded-lg p-4">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'pdf')}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                      {course.pdf && (
                        <p className="mt-2 text-sm text-gray-600">{course.pdf.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCourse}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;