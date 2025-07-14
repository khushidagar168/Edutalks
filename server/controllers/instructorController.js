// server/controllers/instructorController.js
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Topic from '../models/Topic.js';
import Paragraph from '../models/AIParagraph.js'

export const addCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ message: 'Course added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add course' });
  }
};

export const addQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json({ message: 'Quiz added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add quiz' });
  }
};

export const addTopic = async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();
    res.status(201).json({ message: 'Topic added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add topic' });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load courses' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};


export const getStats = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Instructor ID is required.' });
    }

    // Find courses owned by this instructor
    const courses = await Course.find({ owner_id: id });

    // Find quizzes created by this instructor
    const quizzes = await Quiz.find({ instructor_id: id });
    // Find quizzes created by this instructor
    const topics = await Topic.find({ instructor_id: id });

    const paragraphs = await Paragraph.find({ instructorId: id });


    res.status(200).json({
      success: true,
      coursesCount: courses.length,
      quizzesCount: quizzes.length,
      topicsCount: topics.length,
      paragraphsCount: paragraphs.length,
      courses,
      quizzes,
      topics,
      paragraphs
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    res.status(500).json({ message: 'Failed to get instructor stats.', error: error.message });
  }
};

