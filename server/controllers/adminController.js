// server/controllers/adminController.js
import User from '../models/User.js';

// Get all instructors (approved + unapproved)
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' });
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch instructors' });
  }
};

// Approve instructor by ID
export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json({ message: 'Instructor approved', instructor });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed' });
  }
};
