import Course from '../models/Course.js';
import { uploadFile } from '../utils/cloudStorage.js'; // You'll need to implement this

export const getCourses = async (req, res) => {
  const { search, category } = req.query;
  try {
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    const courses = await Course.find(query).populate('owner_id', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { title, description, price, category, owner_id } = req.body;
    // Upload files if they exist
    let imageUrl, pdfUrl;
    if (req.files?.image) {
      imageUrl = await uploadFile(req.files.image[0]);
    }
    if (req.files?.pdf) {
      pdfUrl = await uploadFile(req.files.pdf[0]);
    }

    const newCourse = new Course({
      title,
      description,
      price: parseFloat(price),
      category,
      owner_id,
      image: imageUrl,
      pdf: pdfUrl,
      reviews: []
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course added successfully', course: newCourse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add course' });
  }
};