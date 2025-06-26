import QuizAttempt from '../models/QuizAttempt.js';

export const saveQuizAttempt = async (req, res) => {
  const { quizId, selectedOption, score } = req.body;

  try {
    const attempt = new QuizAttempt({
      user: req.user.id,
      quiz: quizId,
      selectedOption,
      score,
    });

    await attempt.save();
    res.status(201).json({ message: 'Attempt saved' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save attempt' });
  }
};

export const getUserAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id }).populate('quiz');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get attempts' });
  }
};
