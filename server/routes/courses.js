import express from 'express';
import { getCourses, addCourse, updateCourse , deleteCourse} from '../controllers/courseController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();


router.get('/', getCourses);
router.post('/add',
  uploadMiddleware,
  addCourse
);
router.put('/update/:id', uploadMiddleware, updateCourse)
router.put('/admin-update/:id', authenticateAdmin, uploadMiddleware, updateCourse)
router.delete('/admin-delete/:id', authenticateAdmin, deleteCourse)

export default router;
