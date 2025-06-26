import express from 'express';
import { enrollCourse, getEnrolledCourses } from '../controllers/studentController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

router.post('/enroll/:courseId', authenticate, enrollCourse);
router.get('/enrolled-courses', authenticate, getEnrolledCourses);

export default router;
