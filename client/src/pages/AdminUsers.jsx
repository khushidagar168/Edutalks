// pages/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarAdmin from '../components/NavbarAdmin';
import { Mail, Calendar, Users, Trash2, Filter, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    role: '',
    subscriptionType: '',
    joiningDateFrom: '',
    joiningDateTo: '',
    subscriptionExpiryFrom: '',
    subscriptionExpiryTo: '',
    isActive: '',
    emailVerified: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`/admin/users/${selectedUserId}`);
      const updatedUsers = users.filter((u) => u._id !== selectedUserId);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success('User deleted successfully');
      setShowConfirmModal(false);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Role filter
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Subscription type filter
    if (filters.subscriptionType) {
      filtered = filtered.filter(user => user.subscription_type === filters.subscriptionType);
    }

    // Joining date filter
    if (filters.joiningDateFrom) {
      filtered = filtered.filter(user => 
        new Date(user.createdAt) >= new Date(filters.joiningDateFrom)
      );
    }
    if (filters.joiningDateTo) {
      filtered = filtered.filter(user => 
        new Date(user.createdAt) <= new Date(filters.joiningDateTo)
      );
    }

    // Subscription expiry filter
    if (filters.subscriptionExpiryFrom) {
      filtered = filtered.filter(user => 
        new Date(user.subscription_upto) >= new Date(filters.subscriptionExpiryFrom)
      );
    }
    if (filters.subscriptionExpiryTo) {
      filtered = filtered.filter(user => 
        new Date(user.subscription_upto) <= new Date(filters.subscriptionExpiryTo)
      );
    }

    // Active status filter
    if (filters.isActive !== '') {
      filtered = filtered.filter(user => user.isActive === (filters.isActive === 'true'));
    }

    // Email verified filter
    if (filters.emailVerified !== '') {
      filtered = filtered.filter(user => 
        user.verification.email_verified === (filters.emailVerified === 'true')
      );
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      subscriptionType: '',
      joiningDateFrom: '',
      joiningDateTo: '',
      subscriptionExpiryFrom: '',
      subscriptionExpiryTo: '',
      isActive: '',
      emailVerified: ''
    });
    setFilteredUsers(users);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = (subscriptionUpto) => {
    const now = new Date();
    const expiryDate = new Date(subscriptionUpto);
    const isExpired = expiryDate < now;
    
    return {
      isExpired,
      daysLeft: Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))
    };
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Users ({filteredUsers.length})</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Subscription Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Type</label>
                <select
                  value={filters.subscriptionType}
                  onChange={(e) => handleFilterChange('subscriptionType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="trial">Trial</option>
                  <option value="expired">Expired</option>
                  <option value="subscribed">Subscribed</option>
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>


              {/* Joining Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined From</label>
                <input
                  type="date"
                  value={filters.joiningDateFrom}
                  onChange={(e) => handleFilterChange('joiningDateFrom', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Joining Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined To</label>
                <input
                  type="date"
                  value={filters.joiningDateTo}
                  onChange={(e) => handleFilterChange('joiningDateTo', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subscription Expiry From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Expires From</label>
                <input
                  type="date"
                  value={filters.subscriptionExpiryFrom}
                  onChange={(e) => handleFilterChange('subscriptionExpiryFrom', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Subscription Expiry To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Expires To</label>
                <input
                  type="date"
                  value={filters.subscriptionExpiryTo}
                  onChange={(e) => handleFilterChange('subscriptionExpiryTo', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4" />
            {users.length === 0 ? 'No users found' : 'No users match the selected filters'}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const subscriptionStatus = getSubscriptionStatus(user.subscription_upto);
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName || 'No Name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Email: {user.verification.email_verified ? 
                                <span className="text-green-600">Verified</span> : 
                                <span className="text-red-600">Not Verified</span>
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                            <div className="mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.subscription_type === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                            user.subscription_type === 'basic' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.subscription_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <div>
                              <div className={subscriptionStatus.isExpired ? 'text-red-600' : 'text-gray-600'}>
                                {formatDate(user.subscription_upto)}
                              </div>
                              <div className={`text-xs ${
                                subscriptionStatus.isExpired ? 'text-red-500' : 
                                subscriptionStatus.daysLeft <= 7 ? 'text-orange-500' : 'text-gray-500'
                              }`}>
                                {subscriptionStatus.isExpired ? 
                                  'Expired' : 
                                  `${subscriptionStatus.daysLeft} days left`
                                }
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setShowConfirmModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 flex items-center text-sm transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Confirm Deletion</h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mb-6 text-sm text-gray-600">
                Are you sure you want to delete this user? This action cannot be undone and will permanently remove all user data.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;