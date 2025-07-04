// client/src/pages/MyCourses.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';

const MyCourses = () => {
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await axios.get('/student/my-courses');
      setMyCourses(res.data);
    } catch (err) {
      console.error('Failed to fetch enrolled courses');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-yellow-700 mb-6">🎓 My Enrolled Courses</h2>

        {myCourses.length === 0 ? (
          <div className="text-gray-500 text-center">You have not enrolled in any courses yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div key={course._id} className="bg-white p-5 rounded-xl shadow hover:shadow-md transition">
                <h3 className="text-xl font-semibold text-yellow-700 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                  {course.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
