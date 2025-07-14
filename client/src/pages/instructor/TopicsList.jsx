import React from 'react';
import { Trash2, BookOpen, Calendar } from 'lucide-react';
import axios from '../../services/axios';

// ✅ Topic Component
const TopicList = ({ topics = [] }) => {
  const handleDelete = async (topicId, topicTitle) => {
    if (window.confirm(`Are you sure you want to delete "${topicTitle}"?`)) {
      try {
        await axios.delete(`/topics/${topicId}`);
        alert(`Topic "${topicTitle}" deleted successfully!`);
        window.location.reload(); // 🔄 Or use a prop callback to refetch
      } catch (error) {
        console.error('Error deleting topic:', error);
        alert('An error occurred while deleting the topic.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Topics</h2>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
          {Array.isArray(topics) ? topics.length : 0}
        </span>
      </div>

      {!Array.isArray(topics) || topics.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No topics available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {topics.map((topic) => (
            <div
              key={topic._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {topic.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      Order: {topic.order}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{topic.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {formatDate(topic.created_at)}</span>
                    </div>
                    {topic.updated_at !== topic.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Updated: {formatDate(topic.updated_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(topic._id, topic.title)}
                  className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete topic"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Content Preview:
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {topic.content ? topic.content : 'No content available'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicList;
