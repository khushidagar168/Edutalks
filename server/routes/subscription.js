// routes/subscriptionRoutes.js

import express from 'express';
import { redeemCoupon } from '../controllers/subscriptionController.js';
import  authMiddleware  from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/redeem', authMiddleware, redeemCoupon);

export default router;
