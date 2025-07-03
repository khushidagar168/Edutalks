import express from 'express';
import * as quizController from '../controllers/quizController.js';

import authenticate from '../middleware/authenticate.js';
import { addCourse } from '../controllers/courseController.js';

const {
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
} = quizController;

const router = express.Router();

// ✅ Use '/add-quiz' instead of '/create' to match frontend
router.post('/add-quiz', authenticate, createQuiz);

// Quiz CRUD operations (for instructors)
router.get('/instructor', authenticate, getInstructorQuizzes);
router.get('/:id', authenticate, getQuizById);
router.put('/:id', authenticate, updateQuiz);
router.delete('/:id', authenticate, deleteQuiz);

// Public quiz routes (for students)
router.get('/public/all', authenticate, getPublicQuizzes);

// Quiz attempt routes (for students)
router.post('/:id/start', authenticate, startQuizAttempt);
router.put('/attempt/:attemptId/answer', authenticate, submitAnswer);
router.post('/attempt/:attemptId/submit', authenticate, submitQuizAttempt);
router.get('/attempt/:attemptId/results', authenticate, getAttemptResults);

// Quiz analytics (for instructors)
router.get('/:id/statistics', authenticate, getQuizStatistics);

// Violation tracking
router.post('/attempt/:attemptId/violation', authenticate, addViolation);

// Course route (optional)
router.post('/add-course', authenticate, addCourse);

export default router;
