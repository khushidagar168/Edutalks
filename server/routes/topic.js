// routes/topicRoutes.js
import express from 'express';
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic
} from '../controllers/topicController.js';
import { checkStudentSubscription } from '../middleware/auth.js';

const router = express.Router();

router.get('/',checkStudentSubscription,getAllTopics);
router.get('/:id', getTopicById);
router.post('/add', createTopic);
router.put('/:id', updateTopic);
router.delete('/:id', deleteTopic);

export default router;
