import express from 'express';
import { saveQuizAttempt, getUserAttempts } from '../controllers/quizAttemptController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/submit', authenticate, saveQuizAttempt);
router.get('/my-attempts', authenticate, getUserAttempts);

export default router;
