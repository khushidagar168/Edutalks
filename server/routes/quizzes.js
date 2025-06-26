// server/routes/quizzes.js
import express from 'express';
import { getQuizzes, addQuiz } from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getQuizzes);
router.post('/add', authMiddleware, addQuiz);

export default router;
