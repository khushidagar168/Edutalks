// client/src/pages/AddCourse.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import NavbarInstructor from '../components/NavbarInstructor';

const AddCourse = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState({ 
    title: '', 
    category: '', 
    description: '',
    coverImage: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCourse((prev) => ({ ...prev, coverImage: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', course.title);
      formData.append('category', course.category);
      formData.append('description', course.description);
      if (course.coverImage) {
        formData.append('coverImage', course.coverImage);
      }

      await axios.post('/instructor/add-course', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Course added successfully!');
      // Reset form
      setCourse({ title: '', category: '', description: '', coverImage: null });
      setImagePreview(null);
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 2000);
    } catch (err) {
      alert('Failed to add course');
    }
    setLoading(false);
  };

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
          <h1 className="text-xl font-bold text-blue-700">📘 Add New Course</h1>
        </div>
      </div>

      {success && (
        <div className="text-center text-green-700 font-medium mb-4 bg-green-100 py-3 rounded-xl">
          ✅ {success}
        </div>
      )}

      {/* Course Form */}
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Course Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input 
              name="title" 
              value={course.title} 
              onChange={handleInput} 
              placeholder="Enter course title" 
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              value={course.category}
              onChange={handleInput}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Marketing">Marketing</option>
              <option value="Data Science">Data Science</option>
              <option value="Languages">Languages</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Cover Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Course cover preview" 
                    className="mx-auto max-h-48 rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setCourse(prev => ({ ...prev, coverImage: null }));
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-gray-500">
                    📸 Upload Course Cover Image
                  </div>
                  <div className="text-sm text-gray-400">
                    Recommended: 1200x630px, JPG or PNG
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea 
              name="description" 
              value={course.description} 
              onChange={handleInput} 
              placeholder="Describe what students will learn in this course" 
              rows="5"
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button 
              onClick={submitForm} 
              disabled={loading || !course.title || !course.category || !course.description}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '🔄 Adding Course...' : '✅ Add Course'}
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

export default AddCourse;