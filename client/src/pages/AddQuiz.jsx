// client/src/pages/AddQuiz.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../services/axios';
import NavbarInstructor from '../components/NavbarInstructor';

const AddQuiz = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    difficulty_level: '',
    category: '',
    tags: [],
    time_limit: 30,
    passing_score: 60,
    settings: {
      shuffle_questions: false,
      shuffle_options: false,
      show_results_immediately: true,
      allow_review: true,
      max_attempts: 3,
      require_all_questions: true
    },
    course_id: courseId || '',
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ],
    correct_answer_index: 0,
    explanation: '',
    points: 1,
    time_limit: 60,
    tags: []
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, questions, settings
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [tagInput, setTagInput] = useState('');
  const [questionTagInput, setQuestionTagInput] = useState('');

  useEffect(() => {
    if (courseId) {
      setQuiz(prev => ({ ...prev, course_id: courseId }));
    }
  }, [courseId]);

  const handleQuizInput = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setQuiz(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setQuiz(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
      }));
    }
    setError('');
  };

  const handleQuestionInput = (e) => {
    const { name, value, type } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleCorrectAnswerChange = (index) => {
    const newOptions = currentQuestion.options.map((option, i) => ({
      ...option,
      is_correct: i === index
    }));
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions,
      correct_answer_index: index
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, { text: '', is_correct: false }]
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        correct_answer_index: prev.correct_answer_index >= index && prev.correct_answer_index > 0 
          ? prev.correct_answer_index - 1 
          : prev.correct_answer_index
      }));
    }
  };

  const addTag = (tagValue, isQuestionTag = false) => {
    const tag = tagValue.trim().toLowerCase();
    if (tag && !quiz.tags.includes(tag)) {
      if (isQuestionTag) {
        setCurrentQuestion(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag]
        }));
        setQuestionTagInput('');
      } else {
        setQuiz(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove, isQuestionTag = false) => {
    if (isQuestionTag) {
      setCurrentQuestion(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    } else {
      setQuiz(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }));
    }
  };

  const addQuestion = () => {
    if (isQuestionValid()) {
      const questionToAdd = {
        ...currentQuestion,
        _id: Date.now().toString() // Temporary ID for frontend
      };

      if (editingQuestionIndex >= 0) {
        const updatedQuestions = [...quiz.questions];
        updatedQuestions[editingQuestionIndex] = questionToAdd;
        setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
        setEditingQuestionIndex(-1);
      } else {
        setQuiz(prev => ({
          ...prev,
          questions: [...prev.questions, questionToAdd]
        }));
      }

      // Reset current question
      setCurrentQuestion({
        question_text: '',
        question_type: 'multiple_choice',
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false },
          { text: '', is_correct: false }
        ],
        correct_answer_index: 0,
        explanation: '',
        points: 1,
        time_limit: 60,
        tags: []
      });
    }
  };

  const editQuestion = (index) => {
    setCurrentQuestion(quiz.questions[index]);
    setEditingQuestionIndex(index);
    setActiveTab('questions');
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const isQuestionValid = () => {
    return currentQuestion.question_text.trim() && 
           currentQuestion.options.every(option => option.text.trim()) &&
           currentQuestion.options.some(option => option.is_correct);
  };

  const isQuizValid = () => {
    return quiz.title.trim() && 
           quiz.difficulty_level && 
           quiz.questions.length > 0;
  };

  const calculateTotalPoints = () => {
    return quiz.questions.reduce((total, question) => total + (question.points || 1), 0);
  };

  const submitQuiz = async () => {
    if (!isQuizValid()) {
      setError('Please fill in all required fields and add at least one question.');
      return;
    }

    setLoading(true);
    try {
      const quizData = {
        ...quiz,
        total_questions: quiz.questions.length,
        total_points: calculateTotalPoints()
      };

      await axios.post('/instructor/add-quiz', quizData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccess('Quiz created successfully!');
      setTimeout(() => {
        navigate('/instructor/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    }
    setLoading(false);
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      const quizData = {
        ...quiz,
        status: 'draft',
        total_questions: quiz.questions.length,
        total_points: calculateTotalPoints()
      };

      await axios.post('/instructor/add-quiz', quizData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSuccess('Quiz saved as draft!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">

      {/* Header */}
      <div className="bg-white p-4 shadow flex justify-between items-center mb-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/instructor/dashboard')}
            className="text-blue-600 hover:text-blue-800 text-xl"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-blue-700">🧠 Create New Quiz</h1>
        </div>
        <div className="flex space-x-2">
          <span className="text-sm text-gray-600">
            Questions: {quiz.questions.length} | Points: {calculateTotalPoints()}
          </span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="text-center text-green-700 font-medium mb-4 bg-green-100 py-3 rounded-xl">
          ✅ {success}
        </div>
      )}

      {error && (
        <div className="text-center text-red-700 font-medium mb-4 bg-red-100 py-3 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b">
          {['basic', 'questions', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'basic' && '📝'} {tab === 'questions' && '❓'} {tab === 'settings' && '⚙️'} {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input 
                    name="title" 
                    value={quiz.title} 
                    onChange={handleQuizInput} 
                    placeholder="Enter quiz title" 
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty_level"
                    value={quiz.difficulty_level}
                    onChange={handleQuizInput}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Difficulty</option>
                    <option value="easy">🟢 Easy</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea 
                  name="description" 
                  value={quiz.description} 
                  onChange={handleQuizInput} 
                  placeholder="Brief description of the quiz" 
                  rows="3"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input 
                    name="time_limit" 
                    type="number"
                    value={quiz.time_limit} 
                    onChange={handleQuizInput} 
                    min="1"
                    max="300"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input 
                    name="passing_score" 
                    type="number"
                    value={quiz.passing_score} 
                    onChange={handleQuizInput} 
                    min="0"
                    max="100"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input 
                    name="category" 
                    value={quiz.category} 
                    onChange={handleQuizInput} 
                    placeholder="e.g., Programming, Math"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {quiz.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => addTag(tagInput)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Question Form */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingQuestionIndex >= 0 ? 'Edit Question' : 'Add New Question'}
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea 
                        name="question_text" 
                        value={currentQuestion.question_text} 
                        onChange={handleQuestionInput} 
                        placeholder="Enter your question" 
                        rows="3"
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        name="question_type"
                        value={currentQuestion.question_type}
                        onChange={handleQuestionInput}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="fill_blank">Fill in the Blank</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points
                      </label>
                      <input 
                        name="points" 
                        type="number"
                        value={currentQuestion.points} 
                        onChange={handleQuestionInput} 
                        min="1"
                        max="10"
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Limit (seconds)
                      </label>
                      <input 
                        name="time_limit" 
                        type="number"
                        value={currentQuestion.time_limit} 
                        onChange={handleQuestionInput} 
                        min="10"
                        max="600"
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Answer Options *
                      </label>
                      <button
                        onClick={addOption}
                        disabled={currentQuestion.options.length >= 6}
                        className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400"
                      >
                        + Add Option
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            checked={currentQuestion.correct_answer_index === index}
                            onChange={() => handleCorrectAnswerChange(index)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          {currentQuestion.options.length > 2 && (
                            <button
                              onClick={() => removeOption(index)}
                              className="text-red-600 hover:text-red-800 px-2"
                            >
                              ×
                            </button>
                          )}
                          <span className="text-sm text-gray-500 w-16">
                            {currentQuestion.correct_answer_index === index ? '✅ Correct' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea 
                      name="explanation" 
                      value={currentQuestion.explanation} 
                      onChange={handleQuestionInput} 
                      placeholder="Explain why this is the correct answer" 
                      rows="2"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Question Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(currentQuestion.tags || []).map((tag, index) => (
                        <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                          {tag}
                          <button
                            onClick={() => removeTag(tag, true)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex">
                      <input
                        value={questionTagInput}
                        onChange={(e) => setQuestionTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(questionTagInput, true))}
                        placeholder="Add question tag and press Enter"
                        className="flex-1 border border-gray-300 px-4 py-2 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => addTag(questionTagInput, true)}
                        className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Add Question Button */}
                  <div className="flex justify-end space-x-3">
                    {editingQuestionIndex >= 0 && (
                      <button
                        onClick={() => {
                          setEditingQuestionIndex(-1);
                          setCurrentQuestion({
                            question_text: '',
                            question_type: 'multiple_choice',
                            options: [
                              { text: '', is_correct: false },
                              { text: '', is_correct: false },
                              { text: '', is_correct: false },
                              { text: '', is_correct: false }
                            ],
                            correct_answer_index: 0,
                            explanation: '',
                            points: 1,
                            time_limit: 60,
                            tags: []
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={addQuestion}
                      disabled={!isQuestionValid()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {editingQuestionIndex >= 0 ? 'Update Question' : 'Add Question'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Questions ({quiz.questions.length})</h3>
                {quiz.questions.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No questions added yet. Add your first question above.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                      <div key={question._id} className="bg-white border border-gray-200 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                Q{index + 1}
                              </span>
                              <span className="text-sm text-gray-500">
                                {question.points} {question.points === 1 ? 'point' : 'points'} • {question.time_limit}s
                              </span>
                              {question.question_type !== 'multiple_choice' && (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                  {question.question_type.replace('_', ' ').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 mb-2">{question.question_text}</p>
                            <div className="text-sm text-gray-600">
                              <strong>Options:</strong>
                              <ul className="ml-4 mt-1">
                                {question.options.map((option, optIndex) => (
                                  <li key={optIndex} className={`${option.is_correct ? 'text-green-600 font-medium' : ''}`}>
                                    {String.fromCharCode(65 + optIndex)}. {option.text} {option.is_correct && '✓'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            {question.explanation && (
                              <div className="mt-2 text-sm text-gray-600">
                                <strong>Explanation:</strong> {question.explanation}
                              </div>
                            )}
                            {question.tags && question.tags.length > 0 && (
                              <div className="mt-2">
                                {question.tags.map((tag, tagIndex) => (
                                  <span key={tagIndex} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quiz Behavior */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quiz Behavior</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Shuffle Questions</label>
                        <p className="text-sm text-gray-500">Randomize question order for each attempt</p>
                      </div>
                      <input
                        type="checkbox"
                        name="settings.shuffle_questions"
                        checked={quiz.settings.shuffle_questions}
                        onChange={handleQuizInput}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Shuffle Options</label>
                        <p className="text-sm text-gray-500">Randomize answer choices for each question</p>
                      </div>
                      <input
                        type="checkbox"
                        name="settings.shuffle_options"
                        checked={quiz.settings.shuffle_options}
                        onChange={handleQuizInput}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Show Results Immediately</label>
                        <p className="text-sm text-gray-500">Display results after quiz completion</p>
                      </div>
                      <input
                        type="checkbox"
                        name="settings.show_results_immediately"
                        checked={quiz.settings.show_results_immediately}
                        onChange={handleQuizInput}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Allow Review</label>
                        <p className="text-sm text-gray-500">Let students review their answers</p>
                      </div>
                      <input
                        type="checkbox"
                        name="settings.allow_review"
                        checked={quiz.settings.allow_review}
                        onChange={handleQuizInput}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="font-medium text-gray-700">Require All Questions</label>
                        <p className="text-sm text-gray-500">Students must answer all questions</p>
                      </div>
                      <input
                        type="checkbox"
                        name="settings.require_all_questions"
                        checked={quiz.settings.require_all_questions}
                        onChange={handleQuizInput}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Attempt Limits */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Attempt Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Attempts
                      </label>
                      <select
                        name="settings.max_attempts"
                        value={quiz.settings.max_attempts}
                        onChange={handleQuizInput}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>1 Attempt</option>
                        <option value={2}>2 Attempts</option>
                        <option value={3}>3 Attempts</option>
                        <option value={5}>5 Attempts</option>
                        <option value={-1}>Unlimited</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Number of times a student can take this quiz
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Summary */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Quiz Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{quiz.questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{calculateTotalPoints()}</div>
                    <div className="text-sm text-gray-600">Total Points</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{quiz.time_limit}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{quiz.passing_score}%</div>
                    <div className="text-sm text-gray-600">Pass Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {!isQuizValid() && (
              <span className="text-red-600">
                ⚠️ Please complete all required fields and add at least one question
              </span>
            )}
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={saveDraft}
              disabled={loading || quiz.questions.length === 0}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '💾 Saving...' : '💾 Save Draft'}
            </button>
            <button 
              onClick={submitQuiz} 
              disabled={loading || !isQuizValid()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? '🔄 Publishing...' : '🚀 Publish Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;