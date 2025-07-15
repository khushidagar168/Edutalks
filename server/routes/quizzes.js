import express from 'express';
import { getQuizzes, addQuiz, deleteQuiz, getQuizById } from '../controllers/quizController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authenticateAdmin, checkStudentSubscription } from '../middleware/auth.js';

const router = express.Router();

router.get('/',checkStudentSubscription, getQuizzes);
router.get('/:id', getQuizById);
router.post('/add', addQuiz);
router.delete('/:id',deleteQuiz);
router.get('/admin',authenticateAdmin, getQuizzes)

export default router;
