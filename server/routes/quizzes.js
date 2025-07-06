import express from 'express';
import { getQuizzes, addQuiz, deleteQuiz } from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getQuizzes);
router.post('/add', addQuiz);
router.delete('/:id', authMiddleware,deleteQuiz);

export default router;
