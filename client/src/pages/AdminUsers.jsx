// pages/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarAdmin from '../components/NavbarAdmin';
import { Mail, Calendar, Users, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';


const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      await axios.delete(`/admin/users/${selectedUserId}`);
      setUsers(users.filter((u) => u._id !== selectedUserId));
      toast.success('User deleted successfully');
      setShowConfirmModal(false);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">All Users</h1>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="mx-auto h-12 w-12 mb-4" />
            No users found
          </div>
        ) : (
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4">{user.fullName || 'No Name'}</td>
                  <td className="px-6 py-4 flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {user.email}
                  </td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedUserId(user._id);
                        setShowConfirmModal(true);
                      }}
                      className="text-red-600 hover:underline flex items-center text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-4 text-sm text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete
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