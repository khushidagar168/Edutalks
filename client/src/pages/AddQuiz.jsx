import React, { useState, useEffect } from 'react';
import { Plus, X, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import axios from '../services/axios';

const AddQuiz = ({ quizToEdit, onSaveSuccess, onCancel }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    course_id: '',
    instructor_id: user?.id || '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: -1,
    correctAnswer: '',
    explanation: '',
    points: 1,
    blanks: []
  });

  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    if (quizToEdit) {
      const editedQuiz = {
        ...quizToEdit,
        questions: quizToEdit.questions.map(q => ({
          ...q,
          correctAnswerIndex: q.type === 'multiple-choice' 
            ? q.options.indexOf(q.correctAnswer)
            : -1
        }))
      };
      setQuiz(editedQuiz);
    }
  }, [quizToEdit]);

  const questionTypes = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '📝' },
    { value: 'true-false', label: 'True/False', icon: '✓✗' },
    { value: 'fill-blanks', label: 'Fill in the Blanks', icon: '📝' }
  ];

  const handleQuizInput = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionInput = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionTypeChange = (type) => {
    setCurrentQuestion(prev => ({
      ...prev,
      type,
      options: type === 'multiple-choice' ? ['', '', '', ''] : [],
      correctAnswerIndex: -1,
      correctAnswer: type === 'true-false' ? 'true' : '',
      blanks: type === 'fill-blanks' ? [] : []
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      correctAnswerIndex: index
    }));
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    setCurrentQuestion(prev => {
      const newOptions = prev.options.filter((_, i) => i !== index);
      const newCorrectAnswerIndex = prev.correctAnswerIndex === index 
        ? -1 
        : prev.correctAnswerIndex > index 
          ? prev.correctAnswerIndex - 1 
          : prev.correctAnswerIndex;
      
      return {
        ...prev,
        options: newOptions,
        correctAnswerIndex: newCorrectAnswerIndex
      };
    });
  };

  const extractBlanks = (text) => {
    const blankRegex = /\[([^\]]+)\]/g;
    const blanks = [];
    let match;

    while ((match = blankRegex.exec(text)) !== null) {
      blanks.push(match[1]);
    }

    return blanks;
  };

  const handleFillBlanksQuestion = (value) => {
    const blanks = extractBlanks(value);
    setCurrentQuestion(prev => ({
      ...prev,
      question: value,
      blanks: blanks
    }));
  };

  const validateQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert('Please enter a question');
      return false;
    }

    if (currentQuestion.type === 'multiple-choice') {
      const filledOptions = currentQuestion.options.filter(opt => opt.trim());
      if (filledOptions.length < 2) {
        alert('Please provide at least 2 options');
        return false;
      }
      if (currentQuestion.correctAnswerIndex === -1) {
        alert('Please select a correct answer');
        return false;
      }
      if (!currentQuestion.options[currentQuestion.correctAnswerIndex]?.trim()) {
        alert('The selected correct answer cannot be empty');
        return false;
      }
    }

    if (currentQuestion.type === 'true-false') {
      if (!currentQuestion.correctAnswer) {
        alert('Please select True or False');
        return false;
      }
    }

    if (currentQuestion.type === 'fill-blanks') {
      if (currentQuestion.blanks.length === 0) {
        alert('Please add at least one blank using square brackets [answer]');
        return false;
      }
    }

    return true;
  };

  const addQuestion = () => {
    if (!validateQuestion()) return;

    const newQuestion = {
      ...currentQuestion,
      id: Date.now(),
      correctAnswer: currentQuestion.type === 'multiple-choice' 
        ? currentQuestion.options[currentQuestion.correctAnswerIndex] 
        : currentQuestion.correctAnswer
    };

    if (editingIndex >= 0) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.map((q, i) => i === editingIndex ? newQuestion : q)
      }));
      setEditingIndex(-1);
    } else {
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion]
      }));
    }

    resetCurrentQuestion();
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: -1,
      correctAnswer: '',
      explanation: '',
      points: 1,
      blanks: []
    });
  };

  const editQuestion = (index) => {
    const question = quiz.questions[index];
    const editingQuestion = {
      ...question,
      correctAnswerIndex: question.type === 'multiple-choice' 
        ? question.options.indexOf(question.correctAnswer)
        : -1
    };
    setCurrentQuestion(editingQuestion);
    setEditingIndex(index);
  };

  const deleteQuestion = (index) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      alert('Please enter a quiz title');
      return false;
    }

    if (quiz.questions.length === 0) {
      alert('Please add at least one question');
      return false;
    }

    return true;
  };

  const saveQuiz = async () => {
    if (!validateQuiz()) return;

    try {
      const method = quizToEdit ? 'put' : 'post';
      const url = quizToEdit ? `/quizzes/${quizToEdit._id}` : '/quizzes/add';
      
      const quizData = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          correctAnswer: q.type === 'multiple-choice' 
            ? q.options[q.correctAnswerIndex]
            : q.correctAnswer
        }))
      };

      await axios[method](url, quizData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert(`Quiz ${quizToEdit ? 'updated' : 'created'} successfully!`);
      onSaveSuccess();
    } catch (err) {
      console.error('Error saving quiz:', err);
      alert(`Failed to ${quizToEdit ? 'update' : 'create'} quiz. Please try again.`);
    }
  };

  const renderQuestionPreview = (question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    className="text-indigo-600"
                    disabled
                  />
                  <span className={`${option === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'true-false':
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">{question.question}</p>
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`preview-${question.id}`}
                    className="text-indigo-600"
                    disabled
                  />
                  <span className={`${option.toLowerCase() === question.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'fill-blanks':
        const displayText = question.question.replace(/\[([^\]]+)\]/g, '______');
        return (
          <div className="space-y-3">
            <p className="font-medium text-gray-800">{displayText}</p>
            <div className="text-sm text-gray-600">
              <strong>Answers:</strong> {question.blanks.join(', ')}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={onCancel}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to quizzes
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {quizToEdit ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <div className="w-8"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quiz Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Quiz Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={quiz.title}
                      onChange={handleQuizInput}
                      placeholder="e.g. React Fundamentals Quiz"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Description</label>
                    <textarea
                      name="description"
                      value={quiz.description}
                      onChange={handleQuizInput}
                      placeholder="Brief description of the quiz..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium">Time Limit (minutes)</label>
                      <input
                        type="number"
                        name="timeLimit"
                        value={quiz.timeLimit}
                        onChange={handleQuizInput}
                        min="1"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {editingIndex >= 0 ? 'Edit Question' : 'Add New Question'}
                </h2>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-3 font-medium">Question Type</label>
                  <div className="flex flex-wrap gap-3">
                    {questionTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleQuestionTypeChange(type.value)}
                        className={`px-4 py-2 rounded-lg border transition-all duration-200 ${currentQuestion.type === type.value
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
                          }`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">Question*</label>
                  {currentQuestion.type === 'fill-blanks' ? (
                    <div>
                      <textarea
                        value={currentQuestion.question}
                        onChange={(e) => handleFillBlanksQuestion(e.target.value)}
                        placeholder="Enter your question with blanks in square brackets, e.g. 'React is a [JavaScript] library for building [user interfaces]'"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Use square brackets [] to mark blanks. Example: "React is a [JavaScript] library"
                      </p>
                    </div>
                  ) : (
                    <textarea
                      name="question"
                      value={currentQuestion.question}
                      onChange={handleQuestionInput}
                      placeholder="Enter your question..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
                    />
                  )}
                </div>

                {currentQuestion.type === 'multiple-choice' && (
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Options*</label>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="correctAnswerRadio"
                            checked={currentQuestion.correctAnswerIndex === index}
                            onChange={() => handleCorrectAnswerChange(index)}
                            className="text-indigo-600"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {currentQuestion.options.length > 2 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {currentQuestion.options.length < 6 && (
                      <button
                        onClick={addOption}
                        className="mt-3 text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <Plus size={16} />
                        <span>Add Option</span>
                      </button>
                    )}
                  </div>
                )}

                {currentQuestion.type === 'true-false' && (
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Correct Answer*</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="true"
                          checked={currentQuestion.correctAnswer === 'true'}
                          onChange={handleQuestionInput}
                          className="text-indigo-600"
                        />
                        <span>True</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value="false"
                          checked={currentQuestion.correctAnswer === 'false'}
                          onChange={handleQuestionInput}
                          className="text-indigo-600"
                        />
                        <span>False</span>
                      </label>
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'fill-blanks' && currentQuestion.blanks.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-3 font-medium">Detected Blanks</label>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        The following blanks were detected in your question:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.blanks.map((blank, index) => (
                          <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm">
                            {blank}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">Points</label>
                    <input
                      type="number"
                      name="points"
                      value={currentQuestion.points}
                      onChange={handleQuestionInput}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-medium">Explanation (Optional)</label>
                  <textarea
                    name="explanation"
                    value={currentQuestion.explanation}
                    onChange={handleQuestionInput}
                    placeholder="Explain the correct answer..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  {editingIndex >= 0 && (
                    <button
                      onClick={() => {
                        setEditingIndex(-1);
                        resetCurrentQuestion();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={addQuestion}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    {editingIndex >= 0 ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Questions ({quiz.questions.length})
                  </h2>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{showPreview ? 'Hide' : 'Preview'}</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {quiz.questions.map((question, index) => (
                    <div key={question.id} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                            {questionTypes.find(t => t.value === question.type)?.icon}
                          </span>
                          <span className="text-sm text-gray-600">
                            {questionTypes.find(t => t.value === question.type)?.label}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editQuestion(index)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteQuestion(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {showPreview ? (
                        renderQuestionPreview(question)
                      ) : (
                        <div>
                          <p className="text-gray-800 font-medium mb-2 truncate">
                            {question.question}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
                            <span>#{index + 1}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {quiz.questions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No questions added yet</p>
                      <p className="text-sm">Start by adding your first question</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={saveQuiz}
                disabled={quiz.questions.length === 0}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
                  quiz.questions.length === 0 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                }`}
              >
                <Save size={20} />
                <span>Save Quiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;