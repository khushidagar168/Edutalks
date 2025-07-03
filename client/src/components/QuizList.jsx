import React from 'react';

const QuizList = ({ quizzes, selectedOptions, onOptionChange, onSubmit }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {quizzes.map((quiz) => {
        // Fixed: Use quiz.question directly (not quiz.questions[0])
        if (!quiz.question) return null;

        return (
          <div
            key={quiz._id}
            className="bg-white border-l-4 border-yellow-400 p-5 rounded-xl shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-yellow-700">{quiz.title}</h3>
            <p className="text-sm text-gray-500 capitalize">
              {/* Fixed: Use quiz.difficulty (not quiz.difficulty_level) */}
              Difficulty: {quiz.difficulty}
            </p>
            {/* Fixed: Use quiz.question directly */}
            <p className="mt-3 text-gray-700 font-medium">{quiz.question}</p>

            <div className="mt-3 space-y-2">
              {/* Fixed: Use quiz.options directly (not question.options) */}
              {quiz.options?.map((option, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={quiz._id}
                    value={option}
                    checked={selectedOptions[quiz._id] === option}
                    onChange={() => onOptionChange(quiz._id, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>

            <button
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              onClick={() => onSubmit(quiz)}
            >
              🚀 Submit Quiz
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default QuizList;