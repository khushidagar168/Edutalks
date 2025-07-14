import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';

const ParagraphListAdmin = () => {
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user ID safely from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      console.error('No user ID found in localStorage.');
      setLoading(false);
      return;
    }

    const fetchParagraphs = async () => {
      try {
        const res = await axios.get(`/paragraphs`);
        setParagraphs(res.data);
      } catch (err) {
        console.error('Error fetching paragraphs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParagraphs();
  }, [userId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paragraph?')) return;

    try {
      await axios.delete(`/paragraphs/${id}`);
      setParagraphs(prev => prev.filter(p => p._id !== id));
      alert('Deleted successfully');

    } catch (err) {
      console.error('Error deleting paragraph:', err);
      alert('Could not delete paragraph.');
    }
  };

  const handleUpdate = (id) => {
    alert(`Update logic for paragraph ID: ${id}`);
    // TODO: Implement modal or navigate to edit page
  };

  if (!userId) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: User not found. Please log in again.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading paragraphs...
      </div>
    );
  }

  if (paragraphs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No paragraphs found.
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        All Paragraphs ({paragraphs.length})
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paragraphs.map((para) => (
          <div
            key={para._id}
            className="border border-gray-200 bg-white rounded-2xl shadow hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
          >
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {para.category || 'Uncategorized'}
              </h3>
              <p className="text-gray-700 mb-4 line-clamp-5">
                {para.paragraph}
              </p>
              <div className="text-sm text-gray-500 mb-1">
                Instructor:{' '}
                <span className="font-medium">
                  {para.instructorId?.fullName || 'Unknown'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Created:{' '}
                {new Date(para.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              {/* <button
                onClick={() => handleUpdate(para._id)}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors duration-200 text-sm"
              >
                ✏️ Update
              </button> */}
              <button
                onClick={() => handleDelete(para._id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParagraphListAdmin;
