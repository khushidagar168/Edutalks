// client/src/pages/Quizzes.jsx
import React, { useEffect, useState } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';
import QuizList from '../components/QuizList';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [unlockedQuizIndex, setUnlockedQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('/instructor/all-quizzes');
        setQuizzes(res.data);
      } catch (err) {
        console.error('Failed to fetch quizzes');
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(
    (quiz, idx) =>
      (difficulty ? quiz.difficulty === difficulty : true) && idx <= unlockedQuizIndex
  );

  const handleOptionChange = (quizId, selectedOption) => {
    setSelectedOptions({ ...selectedOptions, [quizId]: selectedOption });
  };

  const completeQuiz = async (quiz) => {
    const correct = quiz.correctOption;
    const selected = selectedOptions[quiz._id];
    const isCorrect = selected === correct;

    if (isCorrect) setScore((prev) => prev + 1);

    try {
      await axios.post('/quiz-attempts/submit', {
        quizId: quiz._id,
        selectedOption: selected,
        score: isCorrect ? 1 : 0,
      });
    } catch (err) {
      console.error('Failed to save quiz attempt');
    }

    if (unlockedQuizIndex < quizzes.length - 1) {
      setUnlockedQuizIndex(unlockedQuizIndex + 1);
    }
    setShowResults(true);
    setTimeout(() => setShowResults(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <NavbarStudent />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-extrabold text-yellow-700 mb-6 text-center">🧠 Challenge Yourself with Quizzes</h2>

        <div className="flex justify-center mb-8">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring focus:ring-yellow-200"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-3 rounded mb-6">
          <div
            className="bg-yellow-500 h-3 rounded"
            style={{ width: `${((unlockedQuizIndex + 1) / quizzes.length) * 100}%` }}
          ></div>
        </div>

        {showResults && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center">
            ✅ Quiz submitted! Your current score: {score}
          </div>
        )}

        <QuizList
          quizzes={filteredQuizzes}
          selectedOptions={selectedOptions}
          onOptionChange={handleOptionChange}
          onSubmit={completeQuiz}
        />
      </div>
    </div>
  );
};

export default Quizzes;
