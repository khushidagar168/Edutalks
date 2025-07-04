import express from 'express';
import { getCourses, addCourse } from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.get('/', getCourses);
router.post('/add',
  authMiddleware,
  uploadMiddleware,
  addCourse
);

export default router;
