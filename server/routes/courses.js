import express from 'express';
import { getCourses, addCourse, updateCourse , deleteCourse, getCourseById} from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authenticateAdmin, checkStudentSubscription } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.get('/', checkStudentSubscription, getCourses);
router.get('/:id', getCourseById);
router.post('/add',
  uploadMiddleware,
  addCourse
);
router.put('/update/:id', uploadMiddleware, updateCourse)
router.put('/admin-update/:id', authenticateAdmin, uploadMiddleware, updateCourse)
router.delete('/admin-delete/:id', authenticateAdmin, deleteCourse)

export default router;
