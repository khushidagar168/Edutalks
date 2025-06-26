// server/routes/admin.js
import express from 'express';
import { getAllInstructors, approveInstructor } from '../controllers/adminController.js';
import authenticate from '../middleware/authenticate.js';

const router = express.Router();

// Protect routes with authenticate middleware (optional: check admin role)
router.get('/instructors', authenticate, getAllInstructors);
router.patch('/approve/:id', authenticate, approveInstructor);

export default router;
