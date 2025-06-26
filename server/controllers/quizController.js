import Quiz from '../models/Quiz.js';

export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

export const addQuiz = async (req, res) => {
  const { title, difficulty, question, options, correctOption } = req.body;
  try {
    const newQuiz = new Quiz({
      title,
      difficulty,
      question,
      options,
      correctOption,
      createdBy: req.user.id,
    });
    await newQuiz.save();
    res.status(201).json({ message: 'Quiz added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add quiz' });
  }
};
