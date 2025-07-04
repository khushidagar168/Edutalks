import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize AWS S3 client
const s3 = new S3Client({
  region: 'us-east-2', // e.g. 'ap-south-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = 'edutalks'; // e.g. 'edutalks-uploads'

/**
 * Uploads a file to S3
 * @param {Object} file - Multer file object
 * @param {string} folder - S3 folder (e.g., 'course-images')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export const uploadFile = async (file, folder = 'uploads') => {
  try {
    if (!file || !file.buffer) {
      throw new Error('Invalid file object');
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const Key = `${folder}/${fileName}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make file publicly readable
    };

    await s3.send(new PutObjectCommand(params));

    // Construct the public URL
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${Key}`;
    return fileUrl;
  } catch (error) {
    console.error('Detailed S3 Upload Error:', error);
    throw new Error(`S3 File upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from S3
 * @param {string} fileUrl - Full S3 URL of file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export const deleteFile = async (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    const Key = url.pathname.slice(1); // Remove leading '/'

    const params = {
      Bucket: BUCKET_NAME,
      Key,
    };

    await s3.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Detailed S3 Delete Error:', error);
    throw new Error(`S3 File delete failed: ${error.message}`);
  }
};
