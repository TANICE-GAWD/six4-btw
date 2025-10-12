const config = require('../config/environment');

/**
 * Request logging middleware for monitoring and debugging
 * Logs all incoming requests with relevant details for tracking and analysis
 * 
 * Requirements fulfilled:
 * - 13.4: Request logging and error tracking
 * - 8.6: Logging for monitoring and debugging
 */

/**
 * Generate unique request ID for tracking
 * @returns {string} Unique request identifier
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         'unknown';
}

/**
 * Sanitize sensitive headers for logging
 * @param {Object} headers - Request headers
 * @returns {Object} Sanitized headers
 */
function sanitizeHeaders(headers) {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestLogger(req, res, next) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  
  req.requestId = requestId;
  
  
  const requestLog = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: getClientIP(req),
    timestamp: new Date().toISOString(),
    headers: config.nodeEnv === 'development' ? sanitizeHeaders(req.headers) : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    contentLength: req.get('Content-Length'),
    contentType: req.get('Content-Type')
  };
  
  console.log('Request Start:', JSON.stringify(requestLog, null, 2));
  
  
  const originalJson = res.json;
  res.json = function(data) {
    const processingTime = Date.now() - startTime;
    
    
    const responseLog = {
      requestId,
      statusCode: res.statusCode,
      processingTime,
      responseSize: JSON.stringify(data).length,
      success: data.success !== undefined ? data.success : res.statusCode < 400,
      timestamp: new Date().toISOString()
    };
    
    
    if (!responseLog.success && data.error) {
      responseLog.errorCode = data.error.code;
      responseLog.errorMessage = data.error.message;
    }
    
    console.log('Request Complete:', JSON.stringify(responseLog, null, 2));
    
    
    return originalJson.call(this, data);
  };
  
  
  const originalSend = res.send;
  res.send = function(data) {
    const processingTime = Date.now() - startTime;
    
    const responseLog = {
      requestId,
      statusCode: res.statusCode,
      processingTime,
      responseSize: typeof data === 'string' ? data.length : 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('Request Complete (non-JSON):', JSON.stringify(responseLog, null, 2));
    
    return originalSend.call(this, data);
  };
  
  next();
}

/**
 * Error request logger - logs requests that result in errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorRequestLogger(err, req, res, next) {
  const errorLog = {
    requestId: req.requestId || 'unknown',
    error: {
      message: err.message,
      code: err.code || 'UNKNOWN',
      stack: config.nodeEnv === 'development' ? err.stack : undefined
    },
    request: {
      method: req.method,
      url: req.url,
      ip: getClientIP(req),
      userAgent: req.get('User-Agent')
    },
    timestamp: new Date().toISOString()
  };
  
  console.error('Request Error:', JSON.stringify(errorLog, null, 2));
  
  next(err);
}

/**
 * Performance monitoring middleware
 * Logs slow requests for performance analysis
 * @param {number} threshold - Threshold in milliseconds for slow requests
 * @returns {Function} Express middleware function
 */
function performanceLogger(threshold = 5000) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    
    const originalEnd = res.end;
    res.end = function(...args) {
      const processingTime = Date.now() - startTime;
      
      if (processingTime > threshold) {
        const slowRequestLog = {
          requestId: req.requestId || 'unknown',
          method: req.method,
          url: req.url,
          processingTime,
          threshold,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString(),
          warning: 'SLOW_REQUEST'
        };
        
        console.warn('Slow Request Detected:', JSON.stringify(slowRequestLog, null, 2));
      }
      
      return originalEnd.apply(this, args);
    };
    
    next();
  };
}

/**
 * Security event logger
 * Logs security-related events for monitoring
 * @param {string} event - Security event type
 * @param {Object} req - Express request object
 * @param {Object} details - Additional event details
 */
function logSecurityEvent(event, req, details = {}) {
  const securityLog = {
    event,
    requestId: req.requestId || 'unknown',
    ip: getClientIP(req),
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    details
  };
  
  console.warn('Security Event:', JSON.stringify(securityLog, null, 2));
  
  
  if (config.nodeEnv === 'production') {
    
    
  }
}

module.exports = {
  requestLogger,
  errorRequestLogger,
  performanceLogger,
  logSecurityEvent,
  generateRequestId,
  getClientIP
};