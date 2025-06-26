// client/src/components/CourseList.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';

const CourseList = ({ instructorId, showDelete = false }) => {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/instructor/all-courses');
      const filtered = instructorId
        ? res.data.filter((c) => c.createdBy === instructorId)
        : res.data;
      setCourses(filtered);
    } catch (err) {
      console.error('Failed to fetch courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      try {
        await axios.delete(`/instructor/delete-course/${id}`);
        setCourses((prev) => prev.filter((c) => c._id !== id));
      } catch (err) {
        alert('Failed to delete course');
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <div key={course._id} className="bg-white p-5 rounded-lg shadow">
          <h3 className="text-xl font-bold text-blue-700">{course.title}</h3>
          <p className="text-sm text-gray-500">{course.category}</p>
          <p className="mt-2 text-gray-700">{course.description}</p>
          {showDelete && (
            <button
              onClick={() => handleDelete(course._id)}
              className="mt-3 inline-block bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseList;
