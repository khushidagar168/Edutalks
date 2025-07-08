// Updated AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';
import NavbarAdmin from '../../components/NavbarAdmin';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Download,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [instructors, setInstructors] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInstructors: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    coursesPublished: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
    fetchStats();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/instructors');
      setInstructors(res.data);
    } catch (err) {
      toast.error('Failed to fetch instructors');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/stats');
      setStats({
        ...res.data,
        pendingApprovals: res.data.totalInstructors - (res.data.approvedInstructors || 0),
        activeUsers: Math.floor(res.data.totalUsers * 0.75),
        coursesPublished: res.data.totalInstructors * 3,
      });
    } catch (err) {
      toast.error('Failed to fetch stats');
    }
  };

  const handleCardClick = (title) => {
    switch (title) {
      case 'Total Users':
        navigate('/admin/users');
        break;
      case 'Active Instructors':
        setFilter('approved');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      case 'Pending Approvals':
        setFilter('pending');
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  const approveInstructor = async (id) => {
    try {
      await axios.patch(`/admin/approve/${id}`);
      setInstructors((prev) =>
        prev.map((ins) => (ins._id === id ? { ...ins, isApproved: true } : ins))
      );
      toast.success('Instructor approved');
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const rejectInstructor = async (id) => {
    if (!window.confirm('Are you sure you want to reject this instructor?')) return;
    try {
      await axios.delete(`/admin/reject/${id}`);
      setInstructors((prev) => prev.filter((ins) => ins._id !== id));
      toast.success('Instructor rejected');
    } catch (err) {
      toast.error('Rejection failed');
    }
  };

  const filteredInstructors = instructors.filter((ins) => {
    const matchesSearch =
      ins.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ins.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && !ins.isApproved) ||
      (filter === 'approved' && ins.isApproved);
    return matchesSearch && matchesFilter;
  });

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12.5%',
      bgGradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Active Instructors',
      value: stats.totalInstructors.toLocaleString(),
      icon: GraduationCap,
      change: '+8.2%',
      bgGradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.toString(),
      icon: Clock,
      change: '-5.4%',
      bgGradient: 'from-amber-500 to-amber-600',
    },
  ];



  const userGrowthData = {
    labels: ['Students', 'Instructors', 'Admin'],
    datasets: [
      {
        data: [stats.totalUsers, stats.totalInstructors, 5],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard header and actions */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor and manage your EdTech platform</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.title)}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-sm font-medium text-emerald-600">{card.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${card.bgGradient}`}>
                  <card.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              {card.title==="Total Users" && <button
                onClick={() => navigate('/admin/users')}
                className="my-4 px-4 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
              >
                Manage All Users
              </button>}
            </div>
          ))}
        </div>


        {/* Instructor table with filter/search/approve/reject */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Instructor Management</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search..."
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 px-3 py-1.5 rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {filteredInstructors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6">
                      No instructors found.
                    </td>
                  </tr>
                )}
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor._id} className="border-t">
                    <td className="px-4 py-2">{instructor.name || 'N/A'}</td>
                    <td className="px-4 py-2">{instructor.email}</td>
                    <td className="px-4 py-2">
                      {instructor.isApproved ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-700">
                          <Clock className="w-4 h-4 mr-1" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      {!instructor.isApproved && (
                        <>
                          <button
                            onClick={() => approveInstructor(instructor._id)}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectInstructor(instructor._id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {instructor.isApproved && (
                        <span className="text-gray-400 text-sm">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;