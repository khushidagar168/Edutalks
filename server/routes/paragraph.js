import express from 'express';
import {
  createParagraph,
  getAllParagraphs,
  getParagraphById,
  updateParagraph,
  deleteParagraph,
  getParagraphsByInstructor
} from '../controllers/paragraphController.js';

import { checkStudentSubscription } from '../middleware/auth.js';

const router = express.Router();
// routes/paragraph.js

router.get('/instructor/:instructorId', getParagraphsByInstructor);

// POST /api/paragraphs
router.post('/', createParagraph);

// GET /api/paragraphs
router.get('/', checkStudentSubscription, getAllParagraphs);

// GET /api/paragraphs/:id
router.get('/:id', getParagraphById);

// PUT /api/paragraphs/:id
router.put('/:id', updateParagraph);

// DELETE /api/paragraphs/:id
router.delete('/:id', deleteParagraph);

export default router;
