import express from 'express';
import { getCourses, addCourse, updateCourse } from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.get('/', getCourses);
router.post('/add',
  uploadMiddleware,
  addCourse
);
router.put('/update/:id', uploadMiddleware, updateCourse)

export default router;
