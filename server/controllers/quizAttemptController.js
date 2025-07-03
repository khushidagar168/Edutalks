import QuizAttempt from '../models/QuizAttempt.js';

export const saveQuizAttempt = async (req, res) => {
  const { quizId, selectedOption, score } = req.body;

  try {
    // Fixed: Use correct field names as per QuizAttempt model
    const attempt = new QuizAttempt({
      quiz_id: quizId,           // ✅ Changed from 'quiz' to 'quiz_id'
      student_id: req.user.id,   // ✅ Changed from 'user' to 'student_id'
      status: 'completed',       // ✅ Set status as completed
      score: score,
      score_percentage: score * 100, // Assuming score is 0-1, convert to percentage
      answers: [{
        question_id: quizId, // Using quizId as placeholder
        selected_text: selectedOption,
        is_correct: score > 0,
        points_awarded: score
      }],
      time_submitted: new Date()
    });

    await attempt.save();
    res.status(201).json({ 
      message: 'Quiz attempt saved successfully',
      attemptId: attempt._id 
    });
  } catch (err) {
    console.error('Error saving quiz attempt:', err);
    res.status(500).json({ 
      message: 'Failed to save quiz attempt',
      error: err.message 
    });
  }
};

export const getUserAttempts = async (req, res) => {
  try {
    // Fixed: Use correct field name 'student_id' instead of 'user'
    const attempts = await QuizAttempt.find({ student_id: req.user.id })
      .populate('quiz_id', 'title difficulty_level') // ✅ Changed from 'quiz' to 'quiz_id'
      .sort({ created_at: -1 });
      
    res.json(attempts);
  } catch (err) {
    console.error('Error fetching user attempts:', err);
    res.status(500).json({ 
      message: 'Failed to get attempts',
      error: err.message 
    });
  }
};