// server/models/Course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: String,
  // createdBy: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', courseSchema);
