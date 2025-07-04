import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  image: { type: String }, // URL to image
  pdf: { type: String }, // URL to PDF
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  reviews: [reviewSchema],
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

export default Course;