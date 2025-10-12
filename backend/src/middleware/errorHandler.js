const config = require('../config/environment');
const { createErrorResponse } = require('../utils/validation');

/**
 * Comprehensive error handling middleware with detailed logging and specific error responses
 * Handles various error scenarios with appropriate HTTP status codes and user-friendly messages
 * 
 * Requirements fulfilled:
 * - 8.6: Centralized error handling middleware
 * - 13.2: Specific error responses for different failure scenarios
 * - 13.4: Error tracking and logging
 */

/**
 * Log error details for monitoring and debugging
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {string} errorId - Unique error identifier
 */
function logError(err, req, errorId) {
  const errorDetails = {
    errorId,
    message: err.message,
    code: err.code || 'UNKNOWN',
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    request: {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      headers: config.nodeEnv === 'development' ? req.headers : undefined
    },
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  };

  // Log to console (in production, this would be sent to a logging service)
  console.error('Application Error:', JSON.stringify(errorDetails, null, 2));

  // In production, you would send this to monitoring services like:
  // - Winston logger
  // - Sentry
  // - CloudWatch
  // - Application Insights
  if (config.nodeEnv === 'production') {
    // Example: Send to monitoring service
    // monitoringService.logError(errorDetails);
  }
}

/**
 * Generate unique error ID for tracking
 * @returns {string} Unique error identifier
 */
function generateErrorId() {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const errorHandler = (err, req, res, next) => {
  const errorId = generateErrorId();
  
  // Log error details
  logError(err, req, errorId);

  // Handle specific error types with detailed responses

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      createErrorResponse(
        'FILE_TOO_LARGE',
        `File size exceeds the maximum limit of ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`,
        { 
          errorId,
          maxFileSize: config.upload.maxFileSize,
          allowedTypes: config.upload.allowedTypes
        }
      )
    );
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json(
      createErrorResponse(
        'INVALID_FILE_FIELD',
        'Unexpected file field. Expected field name: "image"',
        { 
          errorId,
          expectedField: 'image'
        }
      )
    );
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json(
      createErrorResponse(
        'TOO_MANY_FILES',
        'Only one file is allowed per request',
        { 
          errorId,
          maxFiles: 1
        }
      )
    );
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json(
      createErrorResponse(
        'CORS_ERROR',
        'Cross-origin request not allowed from this domain',
        { 
          errorId,
          allowedOrigin: config.cors.origin
        }
      )
    );
  }

  // Request parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json(
      createErrorResponse(
        'INVALID_REQUEST_BODY',
        'Request body could not be parsed',
        { errorId }
      )
    );
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json(
      createErrorResponse(
        'REQUEST_TOO_LARGE',
        'Request entity too large',
        { errorId }
      )
    );
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      createErrorResponse(
        'VALIDATION_ERROR',
        err.message,
        { 
          errorId,
          validationDetails: err.details || undefined
        }
      )
    );
  }

  // Google Cloud Vision API specific errors
  if (err.code && err.code.startsWith('VISION_')) {
    const statusCode = getVisionErrorStatusCode(err.code);
    const message = getVisionErrorMessage(err.code);
    
    return res.status(statusCode).json(
      createErrorResponse(
        err.code,
        message,
        { 
          errorId,
          retryable: isRetryableVisionError(err.code),
          service: 'vision'
        }
      )
    );
  }

  // Generic Google Cloud errors
  if (err.code && err.code.toString().startsWith('GOOGLE_')) {
    return res.status(503).json(
      createErrorResponse(
        'AI_SERVICE_ERROR',
        'AI service temporarily unavailable. Please try again later.',
        { 
          errorId,
          retryable: true,
          service: 'google-cloud'
        }
      )
    );
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    return res.status(429).json(
      createErrorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests. Please wait before trying again.',
        { 
          errorId,
          retryAfter: err.retryAfter || 60
        }
      )
    );
  }

  // Authentication/Authorization errors
  if (err.status === 401 || err.statusCode === 401) {
    return res.status(401).json(
      createErrorResponse(
        'UNAUTHORIZED',
        'Authentication required',
        { errorId }
      )
    );
  }

  if (err.status === 403 || err.statusCode === 403) {
    return res.status(403).json(
      createErrorResponse(
        'FORBIDDEN',
        'Access denied',
        { errorId }
      )
    );
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
    return res.status(504).json(
      createErrorResponse(
        'REQUEST_TIMEOUT',
        'Request timed out. Please try again.',
        { 
          errorId,
          retryable: true
        }
      )
    );
  }

  // Network/Connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json(
      createErrorResponse(
        'SERVICE_UNAVAILABLE',
        'External service unavailable. Please try again later.',
        { 
          errorId,
          retryable: true
        }
      )
    );
  }

  // Default server error
  const statusCode = err.statusCode || err.status || 500;
  const message = config.nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(statusCode).json(
    createErrorResponse(
      'INTERNAL_ERROR',
      message,
      { 
        errorId,
        retryable: false
      }
    )
  );
};

/**
 * Get appropriate HTTP status code for Vision API errors
 * @param {string} errorCode - Vision service error code
 * @returns {number} HTTP status code
 */
function getVisionErrorStatusCode(errorCode) {
  const statusMap = {
    'VISION_TIMEOUT': 504,
    'VISION_AUTH_ERROR': 503,
    'VISION_QUOTA_ERROR': 503,
    'VISION_PERMISSION_ERROR': 503,
    'VISION_SERVICE_ERROR': 503
  };
  
  return statusMap[errorCode] || 503;
}

/**
 * Get user-friendly error message for Vision API errors
 * @param {string} errorCode - Vision service error code
 * @returns {string} User-friendly error message
 */
function getVisionErrorMessage(errorCode) {
  const messageMap = {
    'VISION_TIMEOUT': 'Image analysis timed out. Please try again with a smaller image.',
    'VISION_AUTH_ERROR': 'AI service authentication failed. Please try again later.',
    'VISION_QUOTA_ERROR': 'AI service quota exceeded. Please try again later.',
    'VISION_PERMISSION_ERROR': 'AI service access denied. Please try again later.',
    'VISION_SERVICE_ERROR': 'AI service temporarily unavailable. Please try again later.'
  };
  
  return messageMap[errorCode] || 'AI service error. Please try again later.';
}

/**
 * Check if Vision API error is retryable
 * @param {string} errorCode - Vision service error code
 * @returns {boolean} True if error is retryable
 */
function isRetryableVisionError(errorCode) {
  const retryableErrors = ['VISION_TIMEOUT', 'VISION_SERVICE_ERROR'];
  return retryableErrors.includes(errorCode);
}

module.exports = errorHandler;