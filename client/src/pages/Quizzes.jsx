import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Trophy, ArrowRight } from 'lucide-react';
import axios from '../services/axios';
import { useNavigate } from 'react-router-dom';

const QuizCard = ({ quiz, onAttempt }) => (
  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 group">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
          {quiz.title}
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{quiz.timeLimit} min</span>
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3 min-h-20">
        {quiz.description}
      </p>


      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{quiz.questions ? quiz.questions.length : 0} Questions</span>
          </div>
          <div className="flex items-center space-x-1">
            <Trophy className="w-4 h-4" />
            <span>
              {quiz.questions ? quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0) : 0} Points
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onAttempt(quiz._id)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
      >
        <span>Attempt Quiz</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  </div>
);

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('/quizzes');
        setQuizzes(res.data);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleAttemptQuiz = (quizId) => {
    navigate(`/quizzes/${quizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Quiz Portal</h1>
          <p className="text-gray-600 text-lg">Test your knowledge with our interactive quizzes</p>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Quizzes Available</h2>
            <p className="text-gray-500">Check back later for new quizzes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz._id}
                quiz={quiz}
                onAttempt={handleAttemptQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;