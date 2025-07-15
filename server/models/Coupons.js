// models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  expiryDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 255
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status:{
    type: String,
    default: "active"
  },
  usageLimit: {
    type: Number,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

couponSchema.virtual('isAvailable').get(function () {
  return this.isActive && !this.isExpired && this.usedCount < this.usageLimit;
});

couponSchema.index({ couponCode: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

export default mongoose.model('Coupon', couponSchema);
