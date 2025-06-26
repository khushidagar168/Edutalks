import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  question: String,
  options: [String],
  correctOption: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
