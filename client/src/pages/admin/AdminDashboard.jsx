import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';
import NavbarAdmin from '../../components/NavbarAdmin';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [instructors, setInstructors] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalInstructors: 0, totalRevenue: 0 });

  useEffect(() => {
    fetchInstructors();
    fetchStats();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await axios.get('/admin/instructors');
      setInstructors(res.data);
    } catch (err) {
      console.error('Failed to fetch instructors');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const approveInstructor = async (id) => {
    try {
      await axios.patch(`/admin/approve/${id}`);
      alert('Instructor approved ✅');
      fetchInstructors();
    } catch (err) {
      alert('Approval failed ❌');
    }
  };

  const chartData = {
    labels: ['Users', 'Instructors', 'Revenue'],
    datasets: [
      {
        label: 'Platform Insights',
        data: [stats.totalUsers, stats.totalInstructors, stats.totalRevenue],
        backgroundColor: ['#6366F1', '#9333EA', '#10B981'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      <NavbarAdmin />
      <div className="max-w-6xl mx-auto py-10 px-6">
        <h2 className="text-4xl font-extrabold text-indigo-800 mb-10 text-center">🛠️ Admin Dashboard</h2>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {[
            ['👥 Total Users', stats.totalUsers, 'text-indigo-700', 'border-indigo-400'],
            ['🧑‍🏫 Instructors', stats.totalInstructors, 'text-purple-700', 'border-purple-400'],
            ['💰 Revenue', `₹${stats.totalRevenue}`, 'text-green-700', 'border-green-400'],
          ].map(([label, value, color, border], idx) => (
            <div
              key={idx}
              className={`bg-white border-l-4 ${border} p-5 rounded-xl shadow hover:shadow-md transition`}
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow mb-12">
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">📊 Platform Insights</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>

        {/* Instructors Table */}
        <h3 className="text-xl font-bold text-indigo-700 mb-4">📋 Instructor Approvals</h3>
        <div className="space-y-4">
          {instructors.map((ins) => (
            <div
              key={ins._id}
              className="bg-white border-l-4 border-indigo-400 p-5 rounded-xl shadow hover:shadow-md flex justify-between items-center"
            >
              <div>
                <p className="font-medium text-indigo-700">{ins.name || ins.email}</p>
                <p className="text-sm text-gray-500">
                  {ins.email} | {ins.isApproved ? '✅ Approved' : '❌ Pending'}
                </p>
              </div>
              {!ins.isApproved && (
                <button
                  onClick={() => approveInstructor(ins._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Approve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
