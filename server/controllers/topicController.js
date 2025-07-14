// controllers/topicController.js
import Topic from '../models/Topic.js';

// ➡️ GET all topics
export const getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

// ➡️ GET single topic by ID
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
};

// ➡️ POST create new topic
export const createTopic = async (req, res) => {
  try {
    let { title, description, content, course_id, order, instructor_id } = req.body;

    if (!course_id) course_id = null;

    const newTopic = new Topic({
      title,
      description,
      content,
      course_id,
      order,
      instructor_id
    });

    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error adding topic:', error);
    res.status(500).json({ error: 'Failed to add topic' });
  }
};

// ➡️ PUT update topic by ID
export const updateTopic = async (req, res) => {
  try {
    const update = req.body;
    if (update.course_id === '') update.course_id = null;

    const updatedTopic = await Topic.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!updatedTopic) return res.status(404).json({ error: 'Topic not found' });

    res.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
};

// ➡️ DELETE topic by ID
export const deleteTopic = async (req, res) => {
  try {
    const deleted = await Topic.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
};
