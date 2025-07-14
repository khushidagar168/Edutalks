import mongoose from 'mongoose';

const { Schema } = mongoose;

const ParagraphSchema = new Schema(
  {
    paragraph: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: false,
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model('Paragraph', ParagraphSchema);
