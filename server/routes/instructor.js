import express from 'express';
import { addQuiz, getAllQuizzes } from '../controllers/quizController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/add-quiz', authenticate, addQuiz);
router.get('/all-quizzes', getAllQuizzes);

export default router;
