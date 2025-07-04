import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import mongoose from 'mongoose';

// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const quizData = {
      ...req.body,
      instructor_id: instructorId,
      created_by: instructorId
    };

    // Validate required fields
    if (!quizData.title || !quizData.difficulty_level || !quizData.questions || quizData.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, difficulty level, and at least one question are required'
      });
    }

    // Validate and fix course_id
    if (!quizData.course_id || !mongoose.Types.ObjectId.isValid(quizData.course_id)) {
      quizData.course_id = undefined; // Or return error if course_id is required
    }

    // Validate and sanitize questions
    quizData.questions = quizData.questions.map((question, index) => {
      if (!question.question_text || !question.options || question.options.length < 2) {
        throw new Error(`Question ${index + 1} must have text and at least 2 options`);
      }

      const hasCorrectAnswer = question.options.some(option => option.is_correct);
      if (!hasCorrectAnswer) {
        throw new Error(`Question ${index + 1} must have at least one correct answer`);
      }

      // Remove _id to avoid ObjectId casting error
      const { _id, ...cleanedQuestion } = question;
      return cleanedQuestion;
    });

    // Validate difficulty_rating
    if (!quizData.statistics) quizData.statistics = {};
    quizData.statistics.difficulty_rating = Math.max(
      1,
      Math.min(5, quizData.statistics.difficulty_rating || 1)
    );

    // Calculate total questions and points
    quizData.total_questions = quizData.questions.length;
    quizData.total_points = quizData.questions.reduce((total, question) => total + (question.points || 1), 0);

    // Set default status
    quizData.status = quizData.status || 'published';

    const quiz = new Quiz(quizData);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      error: error.message
    });
  }
};

// NOTE: Leave all other quiz functions (`getInstructorQuizzes`, `getQuizById`, etc.) as-is.


// Get all quizzes for instructor
const getInstructorQuizzes = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const { page = 1, limit = 10, status, difficulty, search } = req.query;

    const query = { instructor_id: instructorId };

    // Add filters
    if (status) query.status = status;
    if (difficulty) query.difficulty_level = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate('course_id', 'title')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.status(200).json({
      success: true,
      quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get instructor quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const quiz = await Quiz.findById(id)
      .populate('instructor_id', 'name email')
      .populate('course_id', 'title description');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check permissions
    if (userRole === 'instructor' && quiz.instructor_id._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // If student, check if quiz is published and get attempt history
    if (userRole === 'student') {
      if (quiz.status !== 'published') {
        return res.status(403).json({
          success: false,
          message: 'Quiz is not available'
        });
      }

      // Get student's previous attempts
      const attempts = await QuizAttempt.find({
        quiz_id: id,
        student_id: userId
      }).sort({ attempt_number: -1 });

      // Check if student can take the quiz
      const canTakeQuiz = quiz.settings.max_attempts === -1 || attempts.length < quiz.settings.max_attempts;

      return res.status(200).json({
        success: true,
        quiz: {
          ...quiz.toObject(),
          questions: quiz.questions.map(q => ({
            ...q.toObject(),
            correct_answer_index: undefined,
            options: q.options.map(opt => ({
              text: opt.text,
              _id: opt._id
            }))
          }))
        },
        attempts: attempts.map(attempt => ({
          attempt_number: attempt.attempt_number,
          status: attempt.status,
          score_percentage: attempt.score_percentage,
          is_passed: attempt.is_passed,
          created_at: attempt.created_at
        })),
        canTakeQuiz
      });
    }

    res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz',
      error: error.message
    });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;
    const updateData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if instructor owns the quiz
    if (quiz.instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate if quiz has attempts and trying to modify questions
    const hasAttempts = await QuizAttempt.countDocuments({ quiz_id: id });
    if (hasAttempts > 0 && updateData.questions) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify questions after students have taken the quiz'
      });
    }

    // Update calculated fields if questions are modified
    if (updateData.questions) {
      updateData.total_questions = updateData.questions.length;
      updateData.total_points = updateData.questions.reduce((total, question) => total + (question.points || 1), 0);
    }

    updateData.updated_at = new Date();

    const updatedQuiz = await Quiz.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz',
      error: error.message
    });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if instructor owns the quiz
    if (quiz.instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if quiz has attempts
    const hasAttempts = await QuizAttempt.countDocuments({ quiz_id: id });
    if (hasAttempts > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete quiz with existing attempts. Archive it instead.'
      });
    }

    await Quiz.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete quiz',
      error: error.message
    });
  }
};

// Get public quizzes for students
const getPublicQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, difficulty, category, search, course_id } = req.query;

    const query = { status: 'published' };

    // Add filters
    if (difficulty) query.difficulty_level = difficulty;
    if (category) query.category = { $regex: category, $options: 'i' };
    if (course_id) query.course_id = course_id;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const quizzes = await Quiz.find(query)
      .populate('instructor_id', 'name')
      .populate('course_id', 'title')
      .select('-questions.correct_answer_index -questions.options.is_correct')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Quiz.countDocuments(query);

    res.status(200).json({
      success: true,
      quizzes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get public quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// Start quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not available'
      });
    }

    // Check previous attempts
    const previousAttempts = await QuizAttempt.find({
      quiz_id: id,
      student_id: studentId
    }).sort({ attempt_number: -1 });

    // Check if student can take the quiz
    if (quiz.settings.max_attempts !== -1 && previousAttempts.length >= quiz.settings.max_attempts) {
      return res.status(403).json({
        success: false,
        message: 'Maximum attempts exceeded'
      });
    }

    // Check if there's an active attempt
    const activeAttempt = previousAttempts.find(attempt => attempt.status === 'in_progress');
    if (activeAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active attempt',
        attempt: activeAttempt
      });
    }

    // Create new attempt
    const attemptNumber = previousAttempts.length + 1;
    const timeLimit = quiz.time_limit * 60; // Convert minutes to seconds

    // Prepare questions (shuffle if needed)
    let questions = [...quiz.questions];
    if (quiz.settings.shuffle_questions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    // Prepare answers array
    const answers = questions.map(question => ({
      question_id: question._id,
      question_text: question.question_text,
      selected_option: undefined,
      selected_text: '',
      user_answer: '',
      is_correct: false,
      points_awarded: 0,
      time_taken: 0,
      flagged: false
    }));

    const quizAttempt = new QuizAttempt({
      quiz_id: id,
      student_id: studentId,
      attempt_number: attemptNumber,
      status: 'in_progress',
      answers: answers,
      total_questions: questions.length,
      time_limit: timeLimit,
      remaining_time: timeLimit,
      session_data: {
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        browser: req.get('User-Agent'),
        device: req.get('User-Agent'),
        violations: []
      }
    });

    await quizAttempt.save();

    // Return quiz with questions but without correct answers
    const questionsForAttempt = questions.map(q => ({
      _id: q._id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: quiz.settings.shuffle_options 
        ? q.options.map(opt => ({ text: opt.text, _id: opt._id })).sort(() => Math.random() - 0.5)
        : q.options.map(opt => ({ text: opt.text, _id: opt._id })),
      points: q.points || 1,
      time_limit: q.time_limit,
      tags: q.tags
    }));

    res.status(201).json({
      success: true,
      message: 'Quiz attempt started',
      attempt: {
        _id: quizAttempt._id,
        attempt_number: attemptNumber,
        time_limit: timeLimit,
        remaining_time: timeLimit
      },
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        time_limit: quiz.time_limit,
        total_questions: quiz.total_questions,
        settings: quiz.settings,
        questions: questionsForAttempt
      }
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt',
      error: error.message
    });
  }
};

// Submit answer
const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, selectedText, userAnswer, timeTaken, flagged } = req.body;
    const studentId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      student_id: studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    // Check if attempt is expired
    if (attempt.isExpired()) {
      attempt.status = 'timed_out';
      await attempt.save();
      return res.status(403).json({
        success: false,
        message: 'Quiz attempt has timed out'
      });
    }

    // Find the question in the quiz
    const quiz = await Quiz.findById(attempt.quiz_id);
    const question = quiz.questions.id(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Find the answer in the attempt
    const answerIndex = attempt.answers.findIndex(answer => answer.question_id.toString() === questionId);
    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found in attempt'
      });
    }

    // Update the answer
    const answer = attempt.answers[answerIndex];
    answer.selected_option = selectedOption;
    answer.selected_text = selectedText;
    answer.user_answer = userAnswer;
    answer.time_taken = timeTaken || 0;
    answer.flagged = flagged || false;

    // Check if answer is correct and award points
    let isCorrect = false;
    if (question.question_type === 'multiple_choice' && selectedOption !== undefined) {
      isCorrect = question.options[selectedOption] ? question.options[selectedOption].is_correct : false;
    } else if (question.question_type === 'true_false' && selectedOption !== undefined) {
      isCorrect = question.options[selectedOption] ? question.options[selectedOption].is_correct : false;
    } else if (question.question_type === 'fill_blank' && userAnswer) {
      // Simple string comparison for fill in the blank (could be enhanced with fuzzy matching)
      const correctAnswer = question.options.find(opt => opt.is_correct);
      isCorrect = correctAnswer && userAnswer.toLowerCase().trim() === correctAnswer.text.toLowerCase().trim();
    }

    answer.is_correct = isCorrect;
    answer.points_awarded = isCorrect ? (question.points || 1) : 0;

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      isCorrect: isCorrect,
      pointsAwarded: answer.points_awarded
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit answer',
      error: error.message
    });
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      student_id: studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    const quiz = await Quiz.findById(attempt.quiz_id);

    // Mark as completed
    attempt.status = 'completed';
    attempt.time_submitted = new Date();

    // Check if passed
    const passingScore = quiz.passing_score || 60;
    attempt.calculateGrade(passingScore);

    await attempt.save();

    // Prepare result
    const result = {
      attempt_id: attempt._id,
      quiz_title: quiz.title,
      score: attempt.score,
      score_percentage: attempt.score_percentage,
      total_questions: attempt.total_questions,
      correct_answers: attempt.correct_answers,
      incorrect_answers: attempt.incorrect_answers,
      skipped_questions: attempt.skipped_questions,
      time_taken: attempt.time_taken,
      is_passed: attempt.is_passed,
      passing_score: passingScore,
      attempt_number: attempt.attempt_number
    };

    // Include detailed results if settings allow
    if (quiz.settings.show_results_immediately) {
      result.detailed_results = attempt.answers.map(answer => {
        const question = quiz.questions.id(answer.question_id);
        return {
          question_text: answer.question_text,
          selected_option: answer.selected_option,
          selected_text: answer.selected_text,
          user_answer: answer.user_answer,
          is_correct: answer.is_correct,
          points_awarded: answer.points_awarded,
          correct_answer: question ? question.options.find(opt => opt.is_correct) : null,
          explanation: question ? question.explanation : null
        };
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quiz completed successfully',
      result: result
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz attempt',
      error: error.message
    });
  }
};

// Get quiz attempt results
const getAttemptResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz_id', 'title description passing_score settings')
      .populate('student_id', 'name email');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check permissions
    if (userRole === 'student' && attempt.student_id._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (userRole === 'instructor') {
      const quiz = await Quiz.findById(attempt.quiz_id);
      if (quiz.instructor_id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      attempt: attempt
    });
  } catch (error) {
    console.error('Get attempt results error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attempt results',
      error: error.message
    });
  }
};

// Get quiz statistics for instructor
const getQuizStatistics = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.instructor_id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const stats = await QuizAttempt.getQuizStats(id);
    const attempts = await QuizAttempt.findByQuiz(id, { populate: true });

    res.status(200).json({
      success: true,
      statistics: {
        ...stats,
        pass_rate: stats.total_attempts > 0 ? Math.round((stats.passed_count / stats.total_attempts) * 100) : 0
      },
      recent_attempts: attempts.slice(0, 10)
    });
  } catch (error) {
    console.error('Get quiz statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quiz statistics',
      error: error.message
    });
  }
};

// Add violation to attempt
const addViolation = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { type, details } = req.body;
    const studentId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      student_id: studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Active quiz attempt not found'
      });
    }

    attempt.addViolation(type, details);
    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Violation recorded'
    });
  } catch (error) {
    console.error('Add violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record violation',
      error: error.message
    });
  }
};

export {
  createQuiz,
  getInstructorQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getPublicQuizzes,
  startQuizAttempt,
  submitAnswer,
  submitQuizAttempt,
  getAttemptResults,
  getQuizStatistics,
  addViolation
};