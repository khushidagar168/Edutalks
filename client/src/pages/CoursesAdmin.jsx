import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';

const CoursesAdmin = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, course: null });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourse, setEditCourse] = useState({
    _id: '',
    title: '',
    description: '',
    price: '',
    category: '',
    image: null,
    pdf: null
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/courses', {
        params: { search, category },
      });
      
      // Handle different response structures
      if (Array.isArray(res.data)) {
        setCourses(res.data);
      } else if (res.data && Array.isArray(res.data.courses)) {
        setCourses(res.data.courses);
      } else {
        console.error('Unexpected response structure:', res.data);
        setCourses([]);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditCourse({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      image: null,
      pdf: null
    });
    setShowEditModal(true);
  };

  const handleEditInput = (e) => {
    const { name, value } = e.target;
    setEditCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setEditCourse(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const submitEditCourse = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editCourse.title);
      formData.append('description', editCourse.description);
      formData.append('price', editCourse.price);
      formData.append('category', editCourse.category);
      
      if (editCourse.image) {
        formData.append('image', editCourse.image);
      }
      if (editCourse.pdf) {
        formData.append('pdf', editCourse.pdf);
      }

      const res = await axios.put(`/courses/admin-update/${editCourse._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the course in the state
      setCourses(courses.map(course => 
        course._id === editCourse._id ? res.data : course
      ));
      
      setShowEditModal(false);
      setEditCourse({
        _id: '',
        title: '',
        description: '',
        price: '',
        category: '',
        image: null,
        pdf: null
      });
      
      alert('Course updated successfully!');
    } catch (err) {
      console.error('Failed to update course:', err);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleDelete = async (courseId) => {
    try {
      await axios.delete(`/courses/admin-delete/${courseId}`);
      // Remove the deleted course from the state
      setCourses(courses.filter(course => course._id !== courseId));
      setDeleteModal({ show: false, course: null });
      // Show success message
      alert('Course deleted successfully!');
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  const openDeleteModal = (course) => {
    setDeleteModal({ show: true, course });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, course: null });
  };

  useEffect(() => {
    fetchCourses();
  }, [search, category]);

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    e.target.src = 'https://placehold.co/600x400';
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://placehold.co/600x400';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, you might need to construct the full URL
    // Replace with your actual S3 bucket URL if needed
    return imageUrl;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Manage Courses</h1>
          <p className="text-gray-600">Admin panel for course management</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                id="search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="md:w-64">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Career">Career</option>
                <option value="Environment">Environment</option>
                <option value="Maths">Maths</option>
                <option value="Science">Science</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                {courses.length} course{courses.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.isArray(courses) && courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(course.image)}
                      alt={course.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                        </svg>
                        <span className="truncate">{course.owner_id?.email || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span>{course.reviews?.length || 0} reviews</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(course.price)}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(course)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button 
                          onClick={() => openDeleteModal(course)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {courses.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Edit Course</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Course Title*</label>
                  <input
                    type="text"
                    name="title"
                    value={editCourse.title}
                    onChange={handleEditInput}
                    placeholder="e.g. Advanced React Development"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Description*</label>
                  <textarea
                    name="description"
                    value={editCourse.description}
                    onChange={handleEditInput}
                    placeholder="Describe what students will learn in this course"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Price (₹)*</label>
                    <input
                      type="number"
                      name="price"
                      value={editCourse.price}
                      onChange={handleEditInput}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Category*</label>
                    <select
                      name="category"
                      value={editCourse.category}
                      onChange={handleEditInput}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Technology">Technology</option>
                      <option value="Career">Career</option>
                      <option value="Environment">Environment</option>
                      <option value="Maths">Maths</option>
                      <option value="Science">Science</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Course Image</label>
                    <div className="border-2 border-gray-300 border-dashed rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEditFileChange(e, 'image')}
                        className="hidden"
                        id="edit-course-image"
                      />
                      <label htmlFor="edit-course-image" className="cursor-pointer">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload new image</p>
                          <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                        </div>
                      </label>
                      {editCourse.image && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">{editCourse.image.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Course PDF</label>
                    <div className="border-2 border-gray-300 border-dashed rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleEditFileChange(e, 'pdf')}
                        className="hidden"
                        id="edit-course-pdf"
                      />
                      <label htmlFor="edit-course-pdf" className="cursor-pointer">
                        <div className="text-gray-600">
                          <svg className="mx-auto h-12 w-12 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M14 2H6a2 2 0 00-2 2v40a2 2 0 002 2h32a2 2 0 002-2V8l-8-8z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14 2v6h6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-sm font-medium">Click to upload new PDF</p>
                          <p className="text-xs text-gray-500 mt-1">Leave empty to keep current PDF</p>
                        </div>
                      </label>
                      {editCourse.pdf && (
                        <p className="mt-2 text-sm text-indigo-600 font-medium">{editCourse.pdf.name}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitEditCourse}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Update Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.766 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">Delete Course</h3>
            </div>
            
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{deleteModal.course?.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.course._id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesAdmin;