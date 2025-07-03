import express from 'express';
import Quiz from '../models/Quiz.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ status: 'published' })
      .sort({ created_at: -1 })
      .select('title difficulty_level questions instructor_id');

    const formatted = quizzes.map((quiz) => {
      const q = quiz.questions[0] || {};
      return {
        _id: quiz._id,
        title: quiz.title,
        difficulty: quiz.difficulty_level,
        question: q.question_text,
        options: q.options?.map((opt) => opt.text) || [],
        correctOption: q.options?.[q.correct_answer_index]?.text || '',
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

export default router;
