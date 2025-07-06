import Course from '../models/Course.js';
import { uploadFile } from '../utils/cloudStorage.js';
import { validationResult } from 'express-validator';

// Get all courses with filtering
export const getCourses = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query object
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const courses = await Course.find(query)
      .populate('owner_id', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ 
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Add a new course
export const addCourse = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, price, category, owner_id, tags, level, duration } = req.body;
    
    // Validate required fields
    if (!title || !description || !price || !category || !owner_id) {
      return res.status(400).json({
        message: 'Missing required fields: title, description, price, category, owner_id'
      });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        message: 'Invalid price. Price must be a positive number.'
      });
    }

    // Handle file uploads
    let imageUrl, pdfUrl;
    try {
      if (req.files?.image) {
        imageUrl = await uploadFile(req.files.image[0], 'images');
      }
      if (req.files?.pdf) {
        pdfUrl = await uploadFile(req.files.pdf[0], 'documents');
      }
    } catch (err) {
      console.error('File upload error:', err);
      return res.status(500).json({
        message: 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Create new course
    const newCourse = new Course({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      category,
      owner_id,
      image: imageUrl,
      pdf: pdfUrl,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      level: level || 'beginner',
      duration: duration ? parseInt(duration) : null,
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newCourse.save();
    
    // Populate owner details for response
    await newCourse.populate('owner_id', 'name email');

    res.status(201).json({
      message: 'Course added successfully',
      course: newCourse
    });

  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({
      message: 'Failed to add course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Update an existing course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, tags, level, duration } = req.body;
    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }
    // Validate price if provided
    let parsedPrice;
    if (price !== undefined) {
      parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          message: 'Invalid price. Price must be a positive number.'
        });
      }
    }

    // Handle file uploads
    let imageUrl = existingCourse.image;
    let pdfUrl = existingCourse.pdf;

    try {
      if (req.files?.image) {
        imageUrl = await uploadFile(req.files.image[0], 'images');
      }
      if (req.files?.pdf) {
        pdfUrl = await uploadFile(req.files.pdf[0], 'documents');
      }
    } catch (err) {
      console.error('File upload error:', err);
      return res.status(500).json({
        message: 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    // Build update object
    const updateData = {
      updatedAt: new Date()
    };
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price !== undefined) updateData.price = parsedPrice;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
    if (level) updateData.level = level;
    if (duration) updateData.duration = parseInt(duration);
    if (imageUrl) updateData.image = imageUrl;
    if (pdfUrl) updateData.pdf = pdfUrl;

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner_id', 'name email');
    if (!updatedCourse) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({
      message: 'Failed to update course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get a single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).populate('owner_id', 'name email');
    
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({
      message: 'Failed to fetch course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({
      message: 'Failed to delete course',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get courses by owner
export const getCoursesByOwner = async (req, res) => {
  try {
    const { owner_id } = req.params;
    const courses = await Course.find({ owner_id }).populate('owner_id', 'name email');
    
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses by owner:', err);
    res.status(500).json({
      message: 'Failed to fetch courses',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};