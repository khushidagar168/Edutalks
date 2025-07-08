import express from 'express';
import { getQuizzes, addQuiz, deleteQuiz } from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQuizzes);
router.post('/add', addQuiz);
router.delete('/:id', authMiddleware,deleteQuiz);
router.get('/admin',authenticateAdmin, getQuizzes)

export default router;
