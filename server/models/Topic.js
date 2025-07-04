// server/models/Topic.js
import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  category: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Topic', topicSchema);
