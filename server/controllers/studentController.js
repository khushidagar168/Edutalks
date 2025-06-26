// server/controllers/studentController.js
import Course from '../models/Course.js';
import User from '../models/User.js';

// POST /student/enroll/:courseId
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.courseId;

    const user = await User.findById(userId);
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Enrollment failed' });
  }
};

// GET /student/enrolled-courses
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('enrolledCourses');
    res.json(user.enrolledCourses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get enrolled courses' });
  }
};
