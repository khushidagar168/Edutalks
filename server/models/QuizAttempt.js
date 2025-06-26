import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  selectedOption: String,
  score: Number,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('QuizAttempt', quizAttemptSchema);
