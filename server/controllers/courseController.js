// server/controllers/courseController.js
import Course from '../models/Course.js';

export const getCourses = async (req, res) => {
  const { search, category } = req.query;
  try {
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    const courses = await Course.find(query);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

export const addCourse = async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const newCourse = new Course({
      title,
      description,
      category,
      // createdBy: req.user.id,
    });
    await newCourse.save();
    res.status(201).json({ message: 'Course added' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add course' });
  }
};
