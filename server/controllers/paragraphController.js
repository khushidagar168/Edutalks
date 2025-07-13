import Paragraph from '../models/AIParagraph.js';

// CREATE
export const createParagraph = async (req, res) => {
  try {
    const { paragraph, category, instructorId } = req.body;
    const newParagraph = new Paragraph({ paragraph, category, instructorId });
    const saved = await newParagraph.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating paragraph', error: err.message });
  }
};

// READ ALL
export const getAllParagraphs = async (req, res) => {
  try {
    const paragraphs = await Paragraph.find().populate('instructorId');
    res.json(paragraphs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching paragraphs', error: err.message });
  }
};

// READ ALL BY INSTRUCTOR ID
export const getParagraphsByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params; // or req.query.instructorId

    if (!instructorId) {
      return res.status(400).json({ message: 'Instructor ID is required' });
    }

    const paragraphs = await Paragraph.find({ instructorId }).populate('instructorId');

    res.json(paragraphs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching paragraphs by instructor', error: err.message });
  }
};


// READ ONE
export const getParagraphById = async (req, res) => {
  try {
    const { id } = req.params;
    const paragraph = await Paragraph.findById(id).populate('instructorId');
    if (!paragraph) {
      return res.status(404).json({ message: 'Paragraph not found' });
    }
    res.json(paragraph);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching paragraph', error: err.message });
  }
};

// UPDATE
export const updateParagraph = async (req, res) => {
  try {
    const { id } = req.params;
    const { paragraph, category, instructorId } = req.body;

    const updated = await Paragraph.findByIdAndUpdate(
      id,
      { paragraph, category, instructorId },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Paragraph not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating paragraph', error: err.message });
  }
};

// DELETE
export const deleteParagraph = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Paragraph.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Paragraph not found' });
    }
    res.json({ message: 'Paragraph deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting paragraph', error: err.message });
  }
};
