// client/src/components/NavbarStudent.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeOutlined, 
  BookOutlined, 
  QuestionCircleOutlined, 
  SoundOutlined, 
  FileTextOutlined, 
  CreditCardOutlined, 
  UserOutlined, 
  LogoutOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

const NavbarStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: HomeOutlined },
    { path: '/courses', label: 'Courses', icon: BookOutlined },
    { path: '/quizzes', label: 'Quizzes', icon: QuestionCircleOutlined },
    { path: '/pronunciation', label: 'Pronunciation', icon: SoundOutlined },
    { path: '/daily-topics', label: 'Daily Topics', icon: FileTextOutlined },
    { path: '/subscriptions', label: 'Subscriptions', icon: CreditCardOutlined },
    { path: '/profile', label: 'Profile', icon: UserOutlined },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 z-50 shadow-xl ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-white">EduTalks</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? (
            <RightOutlined className="text-white" />
          ) : (
            <LeftOutlined className="text-white" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className={`flex-shrink-0 text-base ${isActive(item.path) ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-slate-800 border border-slate-600 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <UserOutlined className="text-indigo-200 text-lg" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Student</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 rounded-lg text-rose-300 hover:bg-rose-600 hover:text-white transition-all duration-200 group ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogoutOutlined className="flex-shrink-0 text-base" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
          {isCollapsed && (
            <div className="absolute left-16 bg-slate-800 border border-slate-600 text-white px-2 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default NavbarStudent;