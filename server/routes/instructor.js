import express from 'express';
import { addQuiz, getAllQuizzes } from '../controllers/quizController.js';
import authenticate from '../middleware/authenticate.js';
import {addCourse} from "../controllers/courseController.js"

const router = express.Router();

router.post('/add-quiz', addQuiz);
router.get('/all-quizzes', getAllQuizzes);
router.post('/add-course', addCourse);

export default router;
