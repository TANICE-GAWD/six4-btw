/**
 * Input validation utilities for API endpoints
 * Provides validation functions for request data and file uploads
 */

/**
 * Validate image file properties
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateImageFile(file) {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  
  if (!file.buffer || !file.mimetype || !file.size) {
    errors.push('Invalid file object - missing required properties');
    return { isValid: false, errors };
  }
  
  
  if (!Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
    errors.push('Invalid or empty file buffer');
  }
  
  
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimeTypes.join(', ')}`);
  }
  
  
  const maxSize = 10 * 1024 * 1024; 
  if (file.size > maxSize) {
    errors.push(`File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`);
  }
  
  
  const minSize = 100; 
  if (file.size < minSize) {
    errors.push(`File size ${file.size} bytes is too small. Minimum size is ${minSize} bytes`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      size: file.size,
      type: file.mimetype,
      originalName: file.originalname
    }
  };
}

/**
 * Validate request headers for API endpoints
 * @param {Object} headers - Express request headers
 * @returns {Object} Validation result
 */
function validateRequestHeaders(headers) {
  const errors = [];
  
  
  const contentType = headers['content-type'];
  if (contentType && !contentType.includes('multipart/form-data')) {
    errors.push('Invalid Content-Type. Expected multipart/form-data for file uploads');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate environment configuration for API operations
 * @returns {Object} Validation result
 */
function validateEnvironmentConfig() {
  const errors = [];
  const warnings = [];
  
  
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_KEY_FILE'
  ];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });
  
  
  const recommendedVars = [
    'NODE_ENV',
    'PORT',
    'CORS_ORIGIN'
  ];
  
  recommendedVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`Missing recommended environment variable: ${varName}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize and validate API response data
 * @param {Object} data - Response data to validate
 * @returns {Object} Sanitized and validated data
 */
function sanitizeResponseData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response data: must be an object');
  }
  
  
  const sanitized = {
    success: Boolean(data.success),
    data: data.data || null,
    error: data.error || null
  };
  
  
  if (sanitized.success) {
    if (!sanitized.data) {
      throw new Error('Success response must include data field');
    }
    sanitized.error = null; 
  } else {
    if (!sanitized.error) {
      throw new Error('Error response must include error field');
    }
    sanitized.data = null; 
  }
  
  return sanitized;
}

/**
 * Create standardized error response object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} metadata - Optional metadata
 * @returns {Object} Standardized error response
 */
function createErrorResponse(code, message, metadata = {}) {
  return {
    success: false,
    error: {
      code: code.toUpperCase(),
      message: message,
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
}

/**
 * Create standardized success response object
 * @param {Object} data - Response data
 * @param {Object} metadata - Optional metadata
 * @returns {Object} Standardized success response
 */
function createSuccessResponse(data, metadata = {}) {
  return {
    success: true,
    data: {
      ...data,
      ...metadata
    }
  };
}

module.exports = {
  validateImageFile,
  validateRequestHeaders,
  validateEnvironmentConfig,
  sanitizeResponseData,
  createErrorResponse,
  createSuccessResponse
};