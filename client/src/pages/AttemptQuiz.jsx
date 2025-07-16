import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Trophy, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import axios from '../services/axios';
import { useParams, useNavigate } from 'react-router-dom';

const Timer = ({ timeLeft, totalTime }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / totalTime) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Time Remaining</span>
        <span className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-blue-600'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${
            timeLeft < 60 ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const QuestionCard = ({ question, questionIndex, totalQuestions, selectedAnswer, onAnswerSelect }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-gray-500">
        Question {questionIndex + 1} of {totalQuestions}
      </span>
      <span className="text-sm font-medium text-blue-600">
        {question.points || 1} point{(question.points || 1) > 1 ? 's' : ''}
      </span>
    </div>
    
    <h3 className="text-lg font-semibold text-gray-800 mb-6">
      {question.question}
    </h3>
    
    <div className="space-y-3">
      {question.options.map((option, index) => (
        <button
          key={index}
          onClick={() => onAnswerSelect(option)}
          className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
            selectedAnswer === option
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedAnswer === option
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300'
            }`}>
              {selectedAnswer === option && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>
            <span className="font-medium">{option}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const ResultsPage = ({ quiz, userAnswers, score, onRetry, onBackToList }) => {
  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
            <p className="text-gray-600">Here are your results for {quiz.title}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {score}/{totalQuestions}
            </div>
            <div className="text-2xl font-semibold text-gray-700 mb-2">
              {percentage}%
            </div>
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold ${
              percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Trying!'}
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          {quiz.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-500">
                    Question {index + 1}
                  </span>
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {question.question}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className={`p-3 rounded-lg ${
                    isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <span className="text-sm font-medium text-gray-600">Your Answer: </span>
                    <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {userAnswer || 'Not answered'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                      <span className="text-sm font-medium text-gray-600">Correct Answer: </span>
                      <span className="font-semibold text-green-700">{question.correctAnswer}</span>
                    </div>
                  )}
                </div>
                
                {question.explanation && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Explanation: </span>
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Quiz</span>
          </button>
          <button
            onClick={onBackToList}
            className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-300"
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizAttempt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState('loading'); // 'loading', 'start', 'attempt', 'results'
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

const fetchQuiz = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await axios.get(`/quizzes/${id}`);
    
    if (!response.data || !response.data.quiz) {
      throw new Error('No quiz data received from server');
    }
    
    const quizData = response.data.quiz;
    
    // Validate quiz data structure
    if (!quizData.title || 
        !quizData.questions || 
        !Array.isArray(quizData.questions) || 
        quizData.questions.length === 0) {
      throw new Error('Invalid quiz data structure');
    }
    
    // Validate each question
    quizData.questions.forEach((question, index) => {
      if (!question.question || 
          !question.options || 
          !Array.isArray(question.options) || 
          question.options.length === 0 || 
          !question.correctAnswer) {
        throw new Error(`Invalid question structure at index ${index}`);
      }
    });
    
    setCurrentQuiz(quizData);
    setUserAnswers(new Array(quizData.questions.length).fill(''));
    setTimeLeft(quizData.timeLimit * 60);
    setCurrentPage('start');
    
  } catch (error) {
    console.error('Error fetching Quiz:', error);
    setError(error.response?.data?.message || error.message || 'Error fetching quiz details');
  } finally {
    setLoading(false);
  }
};

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentPage('attempt');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1] || '');
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1] || '');
    }
  };

  const handleQuizComplete = () => {
    setQuizStarted(false);
    setCurrentPage('results');
  };

  const calculateScore = () => {
    if (!currentQuiz || !currentQuiz.questions) return 0;
    return userAnswers.reduce((score, answer, index) => {
      return answer === currentQuiz.questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(currentQuiz.questions.length).fill(''));
    setSelectedAnswer('');
    setTimeLeft(currentQuiz.timeLimit * 60);
    setQuizStarted(false);
    setCurrentPage('start');
  };

  const handleBackToList = () => {
    navigate('/quizzes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleBackToList}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Back to Quiz List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add safety check for currentQuiz  and questions
  if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-yellow-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Quiz Data</h2>
            <p className="text-gray-600 mb-4">This quiz doesn't have any questions available.</p>
            <button
              onClick={handleBackToList}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Back to Quiz List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'results') {
    return (
      <ResultsPage
        quiz={currentQuiz}
        userAnswers={userAnswers}
        score={calculateScore()}
        onRetry={handleRetryQuiz}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h1>
            <button
              onClick={handleBackToList}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              ← Back to Quizzes
            </button>
          </div>
          <p className="text-gray-600">{currentQuiz.description}</p>
        </div>

        {currentPage === 'start' ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start?</h2>
            <div className="space-y-2 mb-6 text-gray-600">
              <p>📝 {currentQuiz.questions.length} Questions</p>
              <p>⏱️ {currentQuiz.timeLimit} Minutes</p>
              <p>🏆 {currentQuiz.questions.reduce((sum, q) => sum + (q.points || 1), 0)} Total Points</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
            >
              Start Quiz
            </button>
          </div>
        ) : (
          <>
            <Timer timeLeft={timeLeft} totalTime={currentQuiz.timeLimit * 60} />
            
            <QuestionCard
              question={currentQuiz.questions[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={currentQuiz.questions.length}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
            />
            
            <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {currentQuiz.questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500'
                        : userAnswers[index]
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {currentQuestionIndex === currentQuiz.questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;