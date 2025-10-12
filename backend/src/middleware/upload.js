const multer = require('multer');


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];

  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    
    const error = new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 1, 
    fields: 1 
  }
});


const uploadSingle = upload.single('image');


const uploadMiddleware = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds the 10MB limit.'
          }
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TOO_MANY_FILES',
            message: 'Only one file is allowed per request.'
          }
        });
      }
      
      if (err.code === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: err.message
          }
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FIELD',
            message: 'Unexpected field. Please use "image" as the field name.'
          }
        });
      }
      
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'File upload failed. Please try again.'
        }
      });
    }
    
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No image file provided. Please upload an image.'
        }
      });
    }
    
    
    next();
  });
};

module.exports = uploadMiddleware;