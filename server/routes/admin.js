// routes/admin.js
import express from 'express';
import {
  getAllInstructors,
  approveInstructor,
  rejectInstructor,
  getAdminStats,
  getAllUsers,
  deleteUser
} from '../controllers/adminController.js';

import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// ✅ Routes
router.get('/instructors', authenticate, getAllInstructors);
router.patch('/approve/:id', authenticate, approveInstructor);
router.delete('/reject/:id', authenticate, rejectInstructor);

router.get('/stats', authenticate, getAdminStats);
router.get('/users', authenticate, getAllUsers);
router.delete('/users/:id', authenticate, deleteUser); // ✅ new route

export default router;
