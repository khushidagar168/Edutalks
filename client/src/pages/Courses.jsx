// client/src/pages/Courses.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/courses', {
        params: { search, category },
      });
      setCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <NavbarStudent />
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">📚 Browse Courses</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="flex-1 px-4 py-2 border rounded shadow-sm focus:ring focus:border-blue-300"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded shadow-sm"
          >
            <option value="">All Categories</option>
            <option value="technology">Technology</option>
            <option value="career">Career</option>
            <option value="environment">Environment</option>
          </select>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="bg-white rounded-xl p-5 shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{course.description}</p>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {course.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
