/**
 * Error message constants and formatting utilities
 * Centralized error handling for consistent user messaging
 */

// File validation error messages
export const FILE_ERRORS = {
  NO_FILE: 'Please select an image to upload',
  INVALID_TYPE: 'Please upload an image file (JPG, PNG, GIF, WebP)',
  FILE_TOO_LARGE: 'File size must be under 10MB',
  MULTIPLE_FILES: 'Please select only one image file'
};

// Network and API error messages
export const API_ERRORS = {
  NETWORK_ERROR: 'Service temporarily unavailable. Please try again.',
  TIMEOUT: 'Upload is taking longer than expected. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  PROCESSING_FAILED: 'Unable to process image. Please try a different image.',
  INVALID_RESPONSE: 'Unexpected response from server. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// General application error messages
export const APP_ERRORS = {
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  CONNECTION_LOST: 'Connection lost. Please check your internet connection.',
  SESSION_EXPIRED: 'Your session has expired. Please refresh the page.'
};

// Error categories for retry logic
export const RETRYABLE_ERRORS = [
  'NETWORK_ERROR',
  'TIMEOUT', 
  'RATE_LIMIT',
  'CONNECTION_LOST'
];

/**
 * Formats error messages for display to users
 * @param {string|Error} error - The error to format
 * @param {string} context - Additional context about where the error occurred
 * @returns {string} - User-friendly error message
 */
export const formatErrorMessage = (error, context = '') => {
  if (!error) {
    return APP_ERRORS.UNKNOWN_ERROR;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    // Check if it's a known API error
    const errorCode = error.code || error.name;
    if (API_ERRORS[errorCode]) {
      return API_ERRORS[errorCode];
    }
    
    // Return the error message or fallback
    return error.message || APP_ERRORS.UNKNOWN_ERROR;
  }
  
  // Handle axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data?.message || FILE_ERRORS.INVALID_TYPE;
      case 413:
        return FILE_ERRORS.FILE_TOO_LARGE;
      case 429:
        return API_ERRORS.RATE_LIMIT;
      case 500:
        return API_ERRORS.PROCESSING_FAILED;
      case 503:
        return API_ERRORS.NETWORK_ERROR;
      default:
        return data?.message || API_ERRORS.UNKNOWN_ERROR;
    }
  }
  
  // Handle network errors
  if (error.request) {
    return API_ERRORS.NETWORK_ERROR;
  }
  
  return APP_ERRORS.UNKNOWN_ERROR;
};

/**
 * Determines if an error is retryable
 * @param {string|Error} error - The error to check
 * @returns {boolean} - True if the error should allow retry
 */
export const isRetryableError = (error) => {
  if (typeof error === 'string') {
    return RETRYABLE_ERRORS.includes(error);
  }
  
  if (error instanceof Error) {
    const errorCode = error.code || error.name;
    return RETRYABLE_ERRORS.includes(errorCode);
  }
  
  // Handle axios errors
  if (error.response) {
    const status = error.response.status;
    // Retry on server errors and rate limiting
    return status >= 500 || status === 429;
  }
  
  // Retry on network errors
  if (error.request) {
    return true;
  }
  
  return false;
};

/**
 * Creates a standardized error object
 * @param {string} code - Error code for programmatic handling
 * @param {string} message - User-friendly error message
 * @param {Object} details - Additional error details
 * @returns {Object} - Standardized error object
 */
export const createError = (code, message, details = {}) => {
  return {
    code,
    message,
    timestamp: new Date().toISOString(),
    retryable: RETRYABLE_ERRORS.includes(code),
    ...details
  };
};