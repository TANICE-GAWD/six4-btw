/**
 * Unit tests for errorHandler middleware
 * Tests error handling scenarios and response formatting
 */

const errorHandler = require('../errorHandler');
const { createErrorResponse } = require('../../utils/validation');

// Mock validation utilities
jest.mock('../../utils/validation', () => ({
  createErrorResponse: jest.fn()
}));

// Mock config
jest.mock('../../config/environment', () => ({
  nodeEnv: 'test',
  upload: {
    maxFileSize: 10485760,
    allowedTypes: ['image/jpeg', 'image/png']
  },
  cors: {
    origin: 'http://localhost:3000'
  }
}));

describe('errorHandler middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      url: '/api/rate',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
      connection: { remoteAddress: '127.0.0.1' },
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();

    createErrorResponse.mockImplementation((code, message, metadata) => ({
      success: false,
      error: { code, message, ...metadata }
    }));

    jest.clearAllMocks();
  });

  test('should handle LIMIT_FILE_SIZE error', () => {
    const error = new Error('File too large');
    error.code = 'LIMIT_FILE_SIZE';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'FILE_TOO_LARGE',
      expect.stringContaining('File size exceeds the maximum limit'),
      expect.objectContaining({
        errorId: expect.any(String),
        maxFileSize: 10485760
      })
    );
  });

  test('should handle LIMIT_UNEXPECTED_FILE error', () => {
    const error = new Error('Unexpected field');
    error.code = 'LIMIT_UNEXPECTED_FILE';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'INVALID_FILE_FIELD',
      'Unexpected file field. Expected field name: "image"',
      expect.objectContaining({
        errorId: expect.any(String),
        expectedField: 'image'
      })
    );
  });

  test('should handle LIMIT_FILE_COUNT error', () => {
    const error = new Error('Too many files');
    error.code = 'LIMIT_FILE_COUNT';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'TOO_MANY_FILES',
      'Only one file is allowed per request',
      expect.objectContaining({
        errorId: expect.any(String),
        maxFiles: 1
      })
    );
  });

  test('should handle CORS errors', () => {
    const error = new Error('Not allowed by CORS');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'CORS_ERROR',
      'Cross-origin request not allowed from this domain',
      expect.objectContaining({
        errorId: expect.any(String),
        allowedOrigin: 'http://localhost:3000'
      })
    );
  });

  test('should handle ValidationError', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.details = { field: 'test' };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'VALIDATION_ERROR',
      'Validation failed',
      expect.objectContaining({
        errorId: expect.any(String),
        validationDetails: { field: 'test' }
      })
    );
  });

  test('should handle Vision API errors', () => {
    const error = new Error('Vision API timeout');
    error.code = 'VISION_TIMEOUT';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(504);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'VISION_TIMEOUT',
      expect.stringContaining('Image analysis timed out'),
      expect.objectContaining({
        errorId: expect.any(String),
        retryable: true,
        service: 'vision'
      })
    );
  });

  test('should handle rate limiting errors', () => {
    const error = new Error('Too many requests from this IP');
    error.retryAfter = 120;

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(429);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please wait before trying again.',
      expect.objectContaining({
        errorId: expect.any(String),
        retryAfter: 120
      })
    );
  });

  test('should handle timeout errors', () => {
    const error = new Error('Request timeout');
    error.code = 'ETIMEDOUT';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(504);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'REQUEST_TIMEOUT',
      'Request timed out. Please try again.',
      expect.objectContaining({
        errorId: expect.any(String),
        retryable: true
      })
    );
  });

  test('should handle connection errors', () => {
    const error = new Error('Connection refused');
    error.code = 'ECONNREFUSED';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'SERVICE_UNAVAILABLE',
      'External service unavailable. Please try again later.',
      expect.objectContaining({
        errorId: expect.any(String),
        retryable: true
      })
    );
  });

  test('should handle generic errors', () => {
    const error = new Error('Generic error');

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(createErrorResponse).toHaveBeenCalledWith(
      'INTERNAL_ERROR',
      'Generic error', // In test mode, shows actual error message
      expect.objectContaining({
        errorId: expect.any(String),
        retryable: false
      })
    );
  });

  test('should log error details', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const error = new Error('Test error');
    error.stack = 'Error stack trace';

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Application Error:',
      expect.stringContaining('Test error')
    );

    consoleSpy.mockRestore();
  });

  test('should generate unique error IDs', () => {
    const error1 = new Error('Error 1');
    const error2 = new Error('Error 2');

    errorHandler(error1, mockReq, mockRes, mockNext);
    const firstCall = createErrorResponse.mock.calls[0];

    errorHandler(error2, mockReq, mockRes, mockNext);
    const secondCall = createErrorResponse.mock.calls[1];

    expect(firstCall[2].errorId).not.toBe(secondCall[2].errorId);
  });

  test('should handle errors with custom status codes', () => {
    const error = new Error('Custom error');
    error.statusCode = 418;

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(418);
  });
});