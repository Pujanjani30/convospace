import multer from 'multer';
import { errorResponse } from '../utils/httpResponse.js';

const storage = multer.memoryStorage();

// Common upload configuration
const uploadFile = (maxSize = 5, allowedTypes = /jpeg|jpg|png|svg|webp/) => {
  return multer({
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 }, // Convert MB to bytes
    fileFilter: (req, file, cb) => {
      try {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        const mimeType = file.mimetype.split('/').pop()?.toLowerCase();

        const isExtensionAllowed = allowedTypes.test(fileExtension);
        const isMimeTypeAllowed = allowedTypes.test(mimeType);

        if (isExtensionAllowed && isMimeTypeAllowed) {
          return cb(null, true);
        } else {
          cb(new Error(`File type .${fileExtension} not supported!`));
        }
      } catch (error) {
        console.log('File upload error:', error);
        cb(new Error('Invalid file format!'));
      }
    }
  });
}

export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return errorResponse({
        res,
        message: 'File size too large!',
        status: 400
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse({
        res,
        message: 'Unexpected field name!',
        status: 400
      });
    }
  }

  if (error.message.includes('File type') || error.message.includes('Invalid file')) {
    return errorResponse({
      res,
      message: error.message,
      status: 400
    });
  }

  next(error);
};


// Specific middleware exports
export const uploadProfilePic = uploadFile().single('profilePic');

// Multi-file upload middleware
export const uploadMultipleFiles = (fieldName, maxSize = 5, allowedTypes) => {
  return uploadFile(maxSize, allowedTypes).array(fieldName);
};

// Generic middleware for any single file
export const uploadSingleFile = (fieldName, maxSize = 5, allowedTypes) => {
  return uploadFile(maxSize, allowedTypes).single(fieldName);
};
