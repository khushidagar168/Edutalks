// utils/uploadMiddleware.js
import multer from 'multer';

// For memory storage (recommended for cloud uploads)
const storage = multer.memoryStorage();

// Alternatively, for disk storage:
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'temp/uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

const upload = multer({ 
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 10MB limit
});

export const uploadMiddleware = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  {name: 'videos'}
]);