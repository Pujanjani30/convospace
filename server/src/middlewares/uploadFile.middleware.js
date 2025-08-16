import multer from 'multer';
import { errorResponse } from '../utils/httpResponse.js';

// Common upload configuration
const uploadFile = (destination = 'public/uploads', maxSize = 5, allowedTypes = /jpeg|jpg|png|svg|webp/) => {
  return multer({
    dest: destination,
    limits: { fileSize: maxSize * 1024 * 1024 }, // Convert MB to bytes
    fileFilter: (req, file, cb) => {
      try {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

        const isExtensionAllowed = allowedTypes.test(fileExtension);

        const isMimetypeAllowed = allowedTypes.test(file.mimetype) ||
          file.mimetype.includes('application/') || // for documents
          file.mimetype.includes('text/') || // for text files
          file.mimetype.includes('video/') || // for videos
          file.mimetype.includes('audio/'); // for audio files

        if (isExtensionAllowed) {
          return cb(null, true);
        } else {
          cb(new Error(`File type .${fileExtension} not supported!`));
        }
      } catch (error) {
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
export const uploadProfilePic = uploadFile('public/uploads/profiles').single('profilePic');

// Multi-file upload middleware
export const uploadMultipleFiles = (fieldName, destination, maxSize = 5) => {
  return uploadFile(destination, maxSize).array(fieldName);
};

// Generic middleware for any single file
export const uploadSingleFile = (fieldName, destination, maxSize = 5, allowedTypes) => {
  return uploadFile(destination, maxSize, allowedTypes).single(fieldName);
};
