import React, { useState, useEffect } from 'react';
import axios from '../services/axios';
import { Edit, Trash2, Plus } from 'lucide-react';
import AddQuiz from './AddQuiz';

const QuizzesAdmin = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [showAddQuiz, setShowAddQuiz] = useState(false);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/quizzes');
            setQuizzes(res.data);
        } catch (err) {
            console.error('Failed to fetch quizzes', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (quizId, userId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await axios.delete(`/quizzes/${quizId}`, {userId: userId} , {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                fetchQuizzes();
            } catch (err) {
                console.error('Failed to delete quiz', err);
            }
        }
    };

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);
        setShowAddQuiz(true);
    };

    const handleAddNew = () => {
        setEditingQuiz(null);
        setShowAddQuiz(true);
    };

    const handleSaveSuccess = () => {
        setShowAddQuiz(false);
        fetchQuizzes();
    };

    if (showAddQuiz) {
        return (
            <AddQuiz
                quizToEdit={editingQuiz}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => setShowAddQuiz(false)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Quizzes</h1>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Create New Quiz</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : quizzes.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <p className="text-gray-600 mb-4">No quizzes found</p>
                        <button
                            onClick={handleAddNew}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            Create your first quiz
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
                            <div className="col-span-5">Title</div>
                            <div className="col-span-2">Questions</div>
                            <div className="col-span-2">Time Limit</div>
                            <div className="col-span-2">Created</div>
                            <div className="col-span-1">Actions</div>
                        </div>

                        {quizzes.map((quiz) => (
                            <div
                                key={quiz._id}
                                className="grid grid-cols-12 p-4 border-b border-gray-200 hover:bg-gray-50 items-center"
                            >
                                <div className="col-span-5 font-medium text-gray-800">
                                    {quiz.title}
                                    {quiz.description && (
                                        <p className="text-sm text-gray-600 mt-1 truncate">{quiz.description}</p>
                                    )}
                                </div>
                                <div className="col-span-2 text-gray-600">
                                    {quiz.questions?.length || 0} questions
                                </div>
                                <div className="col-span-2 text-gray-600">
                                    {quiz.timeLimit} mins
                                </div>
                                <div className="col-span-2 text-gray-600 text-sm">
                                    {new Date(quiz.created_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                                <div className="col-span-1 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(quiz)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(quiz._id, quiz.instructor_id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizzesAdmin;