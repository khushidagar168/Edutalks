// server/routes/courses.js
import express from 'express';
import { getCourses, addCourse } from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCourses);
router.post('/add', authMiddleware, addCourse);

export default router;
