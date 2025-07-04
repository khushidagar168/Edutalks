// controllers/adminController.js
import User from '../models/User.js';

// ✅ Get All Instructors
export const getAllInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' });
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch instructors' });
  }
};

// ✅ Approve Instructor
export const approveInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    res.json({ message: 'Instructor approved', instructor });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed' });
  }
};

// ✅ Reject (Delete) Instructor
export const rejectInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await User.findByIdAndDelete(id);
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    res.json({ message: 'Instructor rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Rejection failed' });
  }
};

// ✅ Get Admin Stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const approvedInstructors = await User.countDocuments({
      role: 'instructor',
      isApproved: true,
    });
    const totalRevenue = 500000; // You can make this dynamic
    res.json({ totalUsers, totalInstructors, approvedInstructors, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ✅ Delete Any User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};