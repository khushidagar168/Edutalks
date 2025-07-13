import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import { BookOpen, ChevronRight, Filter, Search } from 'lucide-react';

const DailyTopics = () => {
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('/topics', {
        params: { category, search: searchQuery },
      });
      setTopics(res.data);
    } catch (err) {
      console.error('Failed to fetch topics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [category, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <BookOpen className="mr-3 text-green-600" size={28} />
              Daily Topics
            </h1>
            <p className="text-gray-500 mt-2">
              Practice your skills with these daily topics
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="career">Work & Career</option>
                <option value="environment">Environment</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
                <option value="health">Health & Wellness</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : topics.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <img 
              src="/empty-state.svg" 
              alt="No topics found" 
              className="w-48 mx-auto mb-4"
            />
            <h3 className="text-xl font-medium text-gray-700">No topics found</h3>
            <p className="text-gray-500 mt-2">
              {searchQuery 
                ? `No results for "${searchQuery}"`
                : "There are currently no topics available in this category."}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {topics.map((topic) => (
              <div
                key={topic._id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {topic.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {topic.description }
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(topic.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 group-hover:text-green-500 transition" />
                  </div>
                  
                  <p className="text-gray-600 mb-4">{topic.content }</p>
                  
                </div>
              </div>
            ))}
          </div>
        )}

        {topics.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Load More Topics
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTopics;
