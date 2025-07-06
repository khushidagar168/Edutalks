import React from 'react';
import { Trash2, Clock, FileText, Calendar } from 'lucide-react';
import axios from '../../services/axios';

const QuizList = ({ quizzes = [] }) => {
    // ✅ Delete handler
    const handleDelete = async (quizId, quizTitle) => {
        if (window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
            try {
                // ✅ Include auth if your axios instance does not automatically attach it
                await axios.delete(`/quizzes/${quizId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // or however you store your token
                    }
                });

                alert(`Quiz "${quizTitle}" deleted successfully!`);
                window.location.reload(); // Or refetch quizzes instead
            } catch (error) {
                console.error('Error deleting quiz:', error);
                alert(
                    error?.response?.data?.message || 'An error occurred while deleting the quiz.'
                );
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };



    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-2 mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Quizzes</h2>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {Array.isArray(quizzes) ? quizzes.length : 0}
                </span>
            </div>

            {!Array.isArray(quizzes) || quizzes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quizzes available</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-gray-600 mb-3">{quiz.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{quiz.timeLimit} minutes</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            <span>{quiz.questions.length} questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Created: {formatDate(quiz.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(quiz._id, quiz.title)}
                                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete quiz"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium text-gray-700 mb-2">
                                    Questions Preview:
                                </h4>
                                <div className="space-y-2">
                                    {quiz.questions.slice(0, 3).map((question, index) => (
                                        <div
                                            key={question._id}
                                            className="flex items-start gap-2"
                                        >
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium min-w-fit">
                                                Q{index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700">
                                                    {question.question}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {question.type}
                                                    </span>
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        {question.points} pt
                                                        {question.points !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {quiz.questions.length > 3 && (
                                        <p className="text-xs text-gray-500 italic">
                                            +{quiz.questions.length - 3} more questions...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList;
