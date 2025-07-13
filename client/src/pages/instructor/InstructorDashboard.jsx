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
import { Spin, message } from 'antd';
import ParagraphList from './ParagraphList';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const InstructorDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showParagraphModal, setShowParagraphModal] = useState(false);
  const [addCourseLoading, setAddCourseLoading] = useState(false);

  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    image: null,
    pdf: null,
    videos: []
  });

  const [topic, setTopic] = useState({
    title: '',
    description: '',
    content: '',
    course_id: '',
    order: 1
  });

  const [paragraphForm, setParagraphForm] = useState({
    paragraph: '',
    category: '',
    instructorId: ''
  });

  const [stats, setStats] = useState({
    coursesCount: 0,
    quizzesCount: 0,
    topicsCount: 0,
    paragraphsCount: 0,
    totalStudents: 0,
    totalRevenue: 0
  });

  const [userCourses, setUserCourses] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [userTopics, setUserTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setParagraphForm(prev => ({ ...prev, instructorId: parsedUser._id }));
    }
  }, []);

  const handleInput = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const files = e.target.files;
    if (field === 'videos') {
      const newVideos = Array.from(files);
      setCourse(prev => ({ ...prev, [field]: [...prev.videos, ...newVideos] }));
    } else {
      setCourse(prev => ({ ...prev, [field]: files[0] }));
    }
  };

  const removeVideo = (indexToRemove) => {
    setCourse(prev => ({
      ...prev,
      videos: prev.videos.filter((_, index) => index !== indexToRemove)
    }));
  };

  const submitCourse = async () => {
    try {
      setAddCourseLoading(true);
      const formData = new FormData();

      formData.append('title', course.title);
      formData.append('description', course.description);
      formData.append('price', course.price);
      formData.append('category', course.category);
      formData.append('owner_id', user.id);

      if (course.image) formData.append('image', course.image);
      if (course.pdf) formData.append('pdf', course.pdf);

      course.videos.forEach(video => {
        formData.append('videos', video);
      });

      await axios.post('/courses/add', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Course added successfully');
      setShowCourseModal(false);
      resetCourseForm();
      fetchStats();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to add course');
    } finally {
      setAddCourseLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourse({
      title: '',
      description: '',
      price: 0,
      category: '',
      image: null,
      pdf: null,
      videos: [],
    });
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

      message.success('Topic added successfully');
      setShowTopicModal(false);
      resetTopicForm();
      fetchStats();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to add topic');
    }
  };

  const resetTopicForm = () => {
    setTopic({
      title: '',
      description: '',
      content: '',
      course_id: '',
      order: 1
    });
  };

  const submitParagraph = async () => {
    try {
      if (!paragraphForm.paragraph || !paragraphForm.category) {
        message.warning('Please fill all required fields');
        return;
      }

      await axios.post('/paragraphs', paragraphForm, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      message.success('Paragraph added successfully');
      setShowParagraphModal(false);
      resetParagraphForm();
      fetchStats();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Error creating paragraph');
    }
  };

  const resetParagraphForm = () => {
    setParagraphForm({
      paragraph: '',
      category: '',
      instructorId: user?._id || ''
    });
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await axios.get(`/instructor/stats/${user.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setStats({
        coursesCount: res.data.coursesCount || 0,
        quizzesCount: res.data.quizzesCount || 0,
        topicsCount: res.data.topicsCount || 0,
        paragraphsCount: res.data.paragraphsCount || 0,
        totalStudents: res.data.totalStudents || 0,
        totalRevenue: res.data.totalRevenue || 0
      });

      setUserCourses(res.data.courses || []);
      setUserQuizzes(res.data.quizzes || []);
      setUserTopics(res.data.topics || []);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      message.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = {
    labels: ['Courses', 'Quizzes', 'Topics', 'Paragraphs'],
    datasets: [
      {
        label: 'Content Count',
        data: [stats.coursesCount, stats.quizzesCount, stats.topicsCount, stats.paragraphsCount],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)'
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
          <Spin size="large" />
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
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
              Welcome back, {user?.fullName || 'Instructor'}! 👋
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
            <button
              onClick={() => setShowParagraphModal(true)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ✍️ Add Paragraph
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 font-medium text-sm">Total Courses</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.coursesCount}</p>
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
                <p className="text-3xl font-bold text-amber-500 mt-1">{stats.quizzesCount}</p>
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
                <p className="text-3xl font-bold text-emerald-500 mt-1">{stats.topicsCount}</p>
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
            <h2 className="text-2xl font-bold text-gray-800">Your Courses ({stats.coursesCount})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <CourseList courses={userCourses} />
        </div>

        {/* Quiz List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Quizzes ({stats.quizzesCount})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <QuizList quizzes={userQuizzes} />
        </div>

        {/* Topic List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Topics ({stats.topicsCount})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <TopicList topics={userTopics} />
        </div>

        {/* Paragraph List */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Your Paragraphs ({stats.paragraphsCount})</h2>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                🔍 Filter
              </button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium">
                📊 Sort
              </button>
            </div>
          </div>
          <ParagraphList userId={user?.id} />
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
                            <path d="M28 8H6a2 2 0 00-2 2v40a2 2 0 002 2h32a2 2 0 002-2V8l-8-8z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
                            <path d="M14 2H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

                {/* Video Upload Section */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Course Videos</label>
                  <div className="border-2 border-gray-300 border-dashed rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'videos')}
                      className="hidden"
                      id="course-videos"
                    />
                    <label htmlFor="course-videos" className="cursor-pointer">
                      <div className="text-gray-600">
                        <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M21 16l-3 3 3 3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-sm font-medium">Click to upload videos</p>
                        <p className="text-xs text-gray-500 mt-1">You can select multiple video files</p>
                      </div>
                    </label>
                    {course.videos.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-indigo-600 font-medium">
                          {course.videos.length} video(s) selected:
                        </p>
                        <div className="max-h-32 overflow-y-auto">
                          {course.videos.map((video, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 mx-2">
                              <span className="text-sm text-gray-700 truncate">{video.name}</span>
                              <button
                                onClick={() => removeVideo(index)}
                                className="text-red-500 hover:text-red-700 ml-2 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <Spin spinning={addCourseLoading} tip="Uploading...">
                    <button
                      onClick={submitCourse}
                      disabled={addCourseLoading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-75"
                    >
                      Submit Course
                    </button>
                  </Spin>
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
      {/* Paragraph Modal */}
      {showParagraphModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Create New Paragraph</h2>
                <button
                  onClick={() => setShowParagraphModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Paragraph Text*</label>
                  <textarea
                    name="paragraph"
                    value={paragraphForm.paragraph}
                    onChange={(e) => handleInput(e, setParagraphForm)}
                    placeholder="Write your paragraph here..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 h-40 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Category*</label>
                  <input
                    type="text"
                    name="category"
                    value={paragraphForm.category}
                    onChange={(e) => handleInput(e, setParagraphForm)}
                    placeholder="e.g. Grammar, Introduction"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                    required
                  />
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowParagraphModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitParagraph}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Create Paragraph
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