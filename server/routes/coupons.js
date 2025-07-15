import express from 'express';
import {
  getAllCoupons,
  createCoupon,
  updateCouponExpiry,
  deleteCoupon
} from '../controllers/couponController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/',authenticateAdmin, getAllCoupons);
router.post('/', authenticateAdmin, createCoupon);
router.patch('/:id/expiry',authenticateAdmin, updateCouponExpiry);
router.delete('/:id', authenticateAdmin, deleteCoupon); 

export default router;
