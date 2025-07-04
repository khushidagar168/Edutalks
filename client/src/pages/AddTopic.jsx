// client/src/pages/AddTopic.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import NavbarInstructor from '../components/NavbarInstructor';

const AddTopic = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState({ 
    category: '', 
    text: '',
    tags: '',
    priority: 'medium',
    targetDate: ''
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setTopic((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      // Convert tags string to array
      const topicData = {
        ...topic,
        tags: topic.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };

      await axios.post('/instructor/add-topic', topicData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccess('Topic added successfully!');
      // Reset form
      setTopic({ 
        category: '', 
        text: '',
        tags: '',
        priority: 'medium',
        targetDate: ''
      });
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 2000);
    } catch (err) {
      alert('Failed to add topic');
    }
    setLoading(false);
  };

  const isFormValid = () => {
    return topic.category && topic.text;
  };

  const categoryOptions = [
    { value: 'work', label: '💼 Work', icon: '💼' },
    { value: 'tech', label: '💻 Technology', icon: '💻' },
    { value: 'education', label: '📚 Education', icon: '📚' },
    { value: 'health', label: '🏥 Health', icon: '🏥' },
    { value: 'lifestyle', label: '🌟 Lifestyle', icon: '🌟' },
    { value: 'finance', label: '💰 Finance', icon: '💰' },
    { value: 'creativity', label: '🎨 Creativity', icon: '🎨' },
    { value: 'other', label: '📝 Other', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <NavbarInstructor />

      {/* Header */}
      <div className="bg-white p-4 shadow flex justify-between items-center mb-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/instructor/dashboard')}
            className="text-blue-600 hover:text-blue-800 text-xl"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-blue-700">📅 Add Daily Topic</h1>
        </div>
      </div>

      {success && (
        <div className="text-center text-green-700 font-medium mb-4 bg-green-100 py-3 rounded-xl">
          ✅ {success}
        </div>
      )}

      {/* Topic Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic Category *
            </label>
            <select
              name="category"
              value={topic.category}
              onChange={handleInput}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic Description *
            </label>
            <textarea 
              name="text" 
              value={topic.text} 
              onChange={handleInput} 
              placeholder="Describe the topic you want to discuss today..." 
              rows="5"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input 
              name="tags" 
              value={topic.tags} 
              onChange={handleInput} 
              placeholder="e.g. programming, react, javascript (comma separated)" 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={topic.priority}
              onChange={handleInput}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Discussion Date (Optional)
            </label>
            <input 
              type="date"
              name="targetDate" 
              value={topic.targetDate} 
              onChange={handleInput} 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preview */}
          {topic.category && topic.text && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Preview:</h3>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">
                  {categoryOptions.find(opt => opt.value === topic.category)?.icon || '📝'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 capitalize">
                    {topic.category}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {topic.text}
                  </div>
                  {topic.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {topic.tags.split(',').map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button 
              onClick={submitForm} 
              disabled={loading || !isFormValid()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '🔄 Adding Topic...' : '✅ Add Topic'}
            </button>
            <button 
              onClick={() => navigate('/instructor/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTopic;