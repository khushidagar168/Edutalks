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
import CourseList from './CoursesList';
import NavbarInstructor from '../../components/NavbarInstructor';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import QuizList from './QuizList';
import TopicList from './TopicsList';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [coursesError, setCoursesError] = useState('');
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: null,
    pdf: null
  });
  const [topic, setTopic] = useState({
    title: '',
    description: '',
    content: '',
    course_id: '',
    order: 1
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    courses: 0,
    quizzes: 0,
    topics: 0,
    totalStudents: 0,
    totalRevenue: 0
  });
  const [userCourses, setUserCourses] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleFileChange = (e, field) => {
    setCourse(prev => ({ ...prev, [field]: e.target.files[0] }));
  };

  const user = JSON.parse(localStorage.getItem('user'));

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
      // fetchUserCourses();
    } catch (err) {
      setError('Failed to add course');
      console.error(err);
    }
  };

  const submitTopic = async () => {
    try {
      await axios.post('/topics/add', {
        ...topic,
        instructor_id: user?.id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccess('Topic added successfully');
      setShowTopicModal(false);
      setTopic({
        title: '',
        description: '',
        content: '',
        course_id: '',
        order: 1
      });
      fetchStats();
    } catch (err) {
      setError('Failed to add topic');
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get(`/instructor/stats/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStats({
        courses: res.data.coursesCount || 0,
        quizzes: res.data.quizzesCount || 0,
        topics: res.data.topicsCount || 0,
        totalStudents: res.data.totalStudents || 0,
        totalRevenue: res.data.totalRevenue || 0
      });
      setUserCourses(res.data.courses)
      setUserQuizzes(res.data.quizzes)
      setUserTopics(res.data.topics)
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
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
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Your Content Overview',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {JSON.parse(localStorage.getItem('user'))?.fullName || 'Instructor'}! 👋
            </h1>
            <p className="text-gray-600">Manage your courses, quizzes, and topics from your dashboard</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowCourseModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📚 Add Course
            </button>
            <button
              onClick={() => navigate('./add-quiz')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📝 Add Quiz
            </button>
            <button
              onClick={() => setShowTopicModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📖 Add Topic
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Courses</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.courses}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Quizzes</h3>
                <p className="text-3xl font-bold text-amber-500 mt-1">{stats.quizzes}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Topics</h3>
                <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.topics}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <span className="text-2xl">📖</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Students</h3>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600 mt-1">${stats.totalRevenue}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Content Statistics</h2>
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Course List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Courses ({stats.courses})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <CourseList
            courses={userCourses}
          />
        </div>
        {/* Quiz List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Quizzes ({stats.quizzes})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <QuizList
            quizzes={userQuizzes}
          />
        </div>
        {/* Topic List */}
         <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Topics ({stats.topics})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <TopicList
            topics={userTopics}
          />
        </div>
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Create New Course</h2>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Course Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={course.title}
                    onChange={(e) => handleInput(e, setCourse)}
                    placeholder="e.g. Advanced React Development"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Description*</label>
                  <textarea
                    name="description"
                    value={course.description}
                    onChange={(e) => handleInput(e, setCourse)}
                    placeholder="Describe what students will learn in this course"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Price ($)*</label>
                    <input
                      type="number"
                      name="price"
                      value={course.price}
                      onChange={(e) => handleInput(e, setCourse)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Category*</label>
                    <input
                      type="text"
                      name="category"
                      value={course.category}
                      onChange={(e) => handleInput(e, setCourse)}
                      placeholder="e.g. Web Development"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Course Image</label>
                    <div className="border-2 border-gray-300 border-dashed rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'image')}
                        className="hidden"
                        id="course-image"
                      />
                      <label htmlFor="course-image" className="cursor-pointer">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload image</p>
                        </div>
                      </label>
                      {course.image && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">{course.image.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Course PDF</label>
                    <div className="border-2 border-gray-300 border-dashed rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'pdf')}
                        className="hidden"
                        id="course-pdf"
                      />
                      <label htmlFor="course-pdf" className="cursor-pointer">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M14 2H6a2 2 0 00-2 2v40a2 2 0 002 2h32a2 2 0 002-2V8l-8-8z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload PDF</p>
                        </div>
                      </label>
                      {course.pdf && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">{course.pdf.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitCourse}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Create New Topic</h2>
                <button
                  onClick={() => setShowTopicModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Topic Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={topic.title}
                    onChange={(e) => handleInput(e, setTopic)}
                    placeholder="e.g. Introduction to React Hooks"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Description*</label>
                  <textarea
                    name="description"
                    value={topic.description}
                    onChange={(e) => handleInput(e, setTopic)}
                    placeholder="Brief description of the topic"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-24 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Content*</label>
                  <textarea
                    name="content"
                    value={topic.content}
                    onChange={(e) => handleInput(e, setTopic)}
                    placeholder="Write the detailed content for this topic..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-40 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Course*</label>
                    <select
                      name="course_id"
                      value={topic.course_id}
                      onChange={(e) => handleInput(e, setTopic)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select a course</option>
                      {userCourses.map(course => (
                        <option key={course._id} value={course._id}>{course.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Order*</label>
                    <input
                      type="number"
                      name="order"
                      value={topic.order}
                      onChange={(e) => handleInput(e, setTopic)}
                      placeholder="1"
                      min="1"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowTopicModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitTopic}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Topic
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