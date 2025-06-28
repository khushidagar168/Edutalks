import React, { useState, useEffect } from 'react';
import NavbarStudent from '../components/NavbarStudent';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  Mic, 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  ChevronRight,
  Play,
  Calendar,
  BarChart3,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    return () => clearInterval(timer);
  }, []);

  const quickAccessItems = [
    {
      to: '/daily-topics',
      title: "Today's Topic",
      desc: 'Practice daily conversations with AI',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      badge: 'New'
    },
    {
      to: '/quizzes',
      title: 'Interactive Quizzes',
      desc: 'Test your knowledge and skills',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      badge: null
    },
    {
      to: '/pronunciation',
      title: 'Speech Practice',
      desc: 'AI-powered pronunciation feedback',
      icon: Mic,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      badge: 'Popular'
    },
  ];

  const statsData = [
    { label: 'Lessons Completed', value: '24', icon: Target, color: 'text-blue-600' },
    { label: 'Quiz Score Avg.', value: '87%', icon: Award, color: 'text-emerald-600' },
    { label: 'Study Streak', value: '7 days', icon: TrendingUp, color: 'text-orange-600' },
    { label: 'Time Spent', value: '12.5h', icon: Clock, color: 'text-purple-600' },
  ];

  const recentActivities = [
    { title: 'Completed: Business English Basics', time: '2 hours ago', type: 'lesson' },
    { title: 'Quiz Score: 94% in Grammar Fundamentals', time: '1 day ago', type: 'quiz' },
    { title: 'Pronunciation Practice: Word Stress', time: '2 days ago', type: 'practice' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarStudent />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {greeting}, Student! 👋
              </h1>
              <p className="text-gray-600">Ready to continue your learning journey?</p>
            </div>
            <div className="mt-4 sm:mt-0 text-right">
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-semibold text-gray-700">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <Link 
                to="/courses" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
              {quickAccessItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                >
                  {item.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                      <item.icon className={`h-6 w-6 ${item.textColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        Start Learning <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Continue Learning Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Continue Your Progress</h3>
                  <p className="text-blue-100 text-sm">Business Communication - Lesson 5</p>
                  <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-3/4"></div>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">75% Complete</p>
                </div>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-full ${
                      activity.type === 'lesson' ? 'bg-blue-100' :
                      activity.type === 'quiz' ? 'bg-purple-100' : 'bg-emerald-100'
                    }`}>
                      {activity.type === 'lesson' && <BookOpen className="h-3 w-3 text-blue-600" />}
                      {activity.type === 'quiz' && <Brain className="h-3 w-3 text-purple-600" />}
                      {activity.type === 'practice' && <Mic className="h-3 w-3 text-emerald-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-gray-500" />
                Weekly Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Complete 5 lessons</span>
                    <span className="font-medium">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Practice 30 minutes</span>
                    <span className="font-medium">25/30</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                Upcoming
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 font-semibold text-sm">
                    Oct<br />15
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Live Session</p>
                    <p className="text-xs text-gray-500">Business Presentation Skills</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold text-sm">
                    Oct<br />18
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Assignment Due</p>
                    <p className="text-xs text-gray-500">Grammar Exercise Set 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;