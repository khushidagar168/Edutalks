import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import { Edit, Trash2, Save, X, Plus, Search, Filter, Calendar, FileText } from 'lucide-react';

const TopicsAdmin = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    content: ''
  });

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get('/topics');
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this topic?')) {
      try {
        await axios.delete(`/topics/${id}`);
        setTopics(topics.filter(topic => topic._id !== id));
      } catch (err) {
        console.error('Failed to delete topic', err);
      }
    }
  };

  const handleEdit = (topic) => {
    setEditingId(topic._id);
    setEditForm({
      title: topic.title,
      description: topic.description,
      content: topic.content
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const res = await axios.put(`/topics/${editingId}`, editForm);
      setTopics(topics.map(topic => 
        topic._id === editingId ? res.data : topic
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update topic', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleAddTopic = () => {
    setShowAddForm(true);
    setAddForm({
      title: '',
      description: '',
      content: ''
    });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAdd = async () => {
    if (!addForm.title.trim()) {
      alert('Please enter a title for the topic');
      return;
    }
    
    try {
      const res = await axios.post('/topics/add', addForm);
      setTopics([res.data, ...topics]);
      setShowAddForm(false);
      setAddForm({
        title: '',
        description: '',
        content: ''
      });
    } catch (err) {
      console.error('Failed to create topic', err);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setAddForm({
      title: '',
      description: '',
      content: ''
    });
  };

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Topics Administration</h1>
          <p className="text-gray-600">Manage your content topics and articles</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleAddTopic}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <Plus size={18} />
              Add Topic
            </button>
          </div>
        </div>

        {/* Add Topic Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Topic</h3>
              <button
                onClick={cancelAdd}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={addForm.title}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter topic title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={addForm.description}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="3"
                  placeholder="Enter topic description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  name="content"
                  value={addForm.content}
                  onChange={handleAddChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  rows="6"
                  placeholder="Enter topic content..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveAdd}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <Save size={18} />
                  Save Topic
                </button>
                <button
                  onClick={cancelAdd}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Topics Grid */}
        <div className="grid gap-6">
          {sortedTopics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === topic._id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="title"
                          value={editForm.title}
                          onChange={handleEditChange}
                          className="w-full text-xl font-semibold border-2 border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Topic title..."
                        />
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                          className="w-full border-2 border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows="3"
                          placeholder="Topic description..."
                        />
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <FileText size={20} className="text-blue-600" />
                          {topic.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{topic.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex items-center gap-2">
                    {editingId === topic._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Save changes"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          title="Cancel editing"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(topic)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit topic"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(topic._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete topic"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Created: {new Date(topic.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  {topic.updated_at && topic.updated_at !== topic.created_at && (
                    <div className="flex items-center gap-1">
                      <Edit size={14} />
                      Updated: {new Date(topic.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedTopics.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No topics found' : 'No topics yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No topics match "${searchTerm}". Try adjusting your search.`
                : 'Get started by creating your first topic.'
              }
            </p>
            {!searchTerm && (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto">
                <Plus size={18} />
                Create First Topic
              </button>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-gray-500">
          <p>
            Showing {sortedTopics.length} of {topics.length} topics
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopicsAdmin;