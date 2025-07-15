// controllers/subscriptionController.js

import Coupon from '../models/Coupons.js';
import User from '../models/User.js';

export const redeemCoupon = async (req, res) => {
  const { couponCode } = req.body;
  const userId = req.user.id; // assuming your auth middleware attaches req.user

  try {
    const coupon = await Coupon.findOne({ couponCode: couponCode.toUpperCase().trim() });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid coupon code.' });
    }

    // Check if coupon is marked as active
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is inactive or already used.' });
    }

    // Check if coupon is expired
    const isExpired = new Date() > coupon.expiryDate;
    if (isExpired) {
      // Optional: If you want, mark it inactive if it’s expired
    //   coupon.isActive = false;
    //   await coupon.save();
      return res.status(400).json({ message: 'Coupon has expired.' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Determine the base date to extend from
    const baseDate = user.subscription_upto && user.subscription_upto > new Date()
      ? new Date(user.subscription_upto)
      : new Date();

    // Extend subscription by 1 year
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    user.subscription_upto = baseDate;
    user.subscription_type = 'subscribed';

    // Mark coupon as used/inactive
    coupon.isActive = false;

    await Promise.all([user.save(), coupon.save()]);

    res.json({
      message: 'Coupon redeemed successfully! Your subscription has been extended by 1 year.',
      newExpiry: user.subscription_upto
    });

  } catch (err) {
    console.error('Redeem coupon error:', err);
    res.status(500).json({ message: 'Something went wrong while redeeming the coupon.' });
  }
};
