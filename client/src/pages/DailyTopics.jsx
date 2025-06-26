// client/src/pages/DailyTopics.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';

const DailyTopics = () => {
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState('');

  const fetchTopics = async () => {
    try {
      const res = await axios.get('/topics', {
        params: { category },
      });
      setTopics(res.data);
    } catch (err) {
      console.error('Failed to fetch topics');
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <NavbarStudent />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-green-700 mb-6">🗒️ Daily Speaking Topics</h2>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded shadow-sm text-gray-700"
          >
            <option value="">All Categories</option>
            <option value="career">Work & Career</option>
            <option value="environment">Environment</option>
            <option value="technology">Technology</option>
          </select>
        </div>

        {topics.length === 0 ? (
          <p className="text-gray-500 text-center">No topics available.</p>
        ) : (
          <ul className="space-y-4">
            {topics.map((topic) => (
              <li
                key={topic._id}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md transition border-l-4 border-green-300"
              >
                <h4 className="font-semibold text-green-800">{topic.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{topic.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DailyTopics;
