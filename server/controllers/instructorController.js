// server/controllers/instructorController.js
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Topic from '../models/Topic.js';

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
