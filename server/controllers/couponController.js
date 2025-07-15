import Coupon from '../models/Coupons.js';

// Generate random alphanumeric code
function generateCouponCode(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const { amount, expiryDate, description } = req.body;
    const couponCode = generateCouponCode();

    const newCoupon = new Coupon({
      couponCode,
      amount,
      expiryDate,
      description,
      createdBy: req.user?._id // If you have auth middleware
    });

    await newCoupon.save();
    res.status(201).json(newCoupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update expiry date
export const updateCouponExpiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { expiryDate } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { expiryDate },
      { new: true }
    );

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

