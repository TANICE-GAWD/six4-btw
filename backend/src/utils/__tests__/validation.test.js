/**
 * Unit tests for validation utilities
 * Tests file validation and error handling scenarios
 * 
 * Requirements fulfilled:
 * - Test file validation and error handling scenarios
 */

const {
  validateImageFile,
  validateRequestHeaders,
  validateEnvironmentConfig,
  sanitizeResponseData,
  createErrorResponse,
  createSuccessResponse
} = require('../validation');

describe('Validation Utilities', () => {
  describe('validateImageFile', () => {
    test('should validate correct image file', () => {
      const validFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        originalname: 'test.jpg'
      };

      const result = validateImageFile(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fileInfo).toMatchObject({
        size: 1024 * 1024,
        type: 'image/jpeg',
        originalName: 'test.jpg'
      });
    });

    test('should reject file that is too large', () => {
      const largeFile = {
        buffer: Buffer.alloc(15 * 1024 * 1024), // 15MB
        mimetype: 'image/jpeg',
        size: 15 * 1024 * 1024,
        originalname: 'large.jpg'
      };

      const result = validateImageFile(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('exceeds maximum allowed size'));
    });

    test('should reject file that is too small', () => {
      const smallFile = {
        buffer: Buffer.from('x'),
        mimetype: 'image/jpeg',
        size: 50, // 50 bytes
        originalname: 'small.jpg'
      };

      const result = validateImageFile(smallFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('too small'));
    });

    test('should reject invalid MIME types', () => {
      const invalidFile = {
        buffer: Buffer.from('fake-data'),
        mimetype: 'text/plain',
        size: 1024,
        originalname: 'test.txt'
      };

      const result = validateImageFile(invalidFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid file type'));
    });

    test('should accept all valid image MIME types', () => {
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

      validMimeTypes.forEach(mimetype => {
        const file = {
          buffer: Buffer.from('fake-image-data'),
          mimetype,
          size: 1024,
          originalname: `test.${mimetype.split('/')[1]}`
        };

        const result = validateImageFile(file);
        expect(result.isValid).toBe(true);
      });
    });

    test('should reject null or undefined file', () => {
      expect(validateImageFile(null).isValid).toBe(false);
      expect(validateImageFile(undefined).isValid).toBe(false);
      expect(validateImageFile(null).errors).toContain('No file provided');
    });

    test('should reject file with missing properties', () => {
      const incompleteFile = {
        mimetype: 'image/jpeg',
        size: 1024
        // Missing buffer and originalname
      };

      const result = validateImageFile(incompleteFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('missing required properties'));
    });

    test('should reject file with invalid buffer', () => {
      const invalidBufferFile = {
        buffer: 'not-a-buffer',
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'test.jpg'
      };

      const result = validateImageFile(invalidBufferFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid or empty file buffer'));
    });

    test('should reject file with empty buffer', () => {
      const emptyBufferFile = {
        buffer: Buffer.alloc(0),
        mimetype: 'image/jpeg',
        size: 0,
        originalname: 'test.jpg'
      };

      const result = validateImageFile(emptyBufferFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid or empty file buffer'));
    });
  });

  describe('validateRequestHeaders', () => {
    test('should validate correct multipart headers', () => {
      const headers = {
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      };

      const result = validateRequestHeaders(headers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid content type', () => {
      const headers = {
        'content-type': 'application/json'
      };

      const result = validateRequestHeaders(headers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Invalid Content-Type'));
    });

    test('should handle missing content type', () => {
      const headers = {};

      const result = validateRequestHeaders(headers);

      expect(result.isValid).toBe(true); // Should be valid when no content-type specified
    });
  });

  describe('validateEnvironmentConfig', () => {
    let originalEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('should validate complete environment configuration', () => {
      process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
      process.env.GOOGLE_CLOUD_KEY_FILE = 'test-key.json';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3001';
      process.env.CORS_ORIGIN = 'http://localhost:3000';

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should identify missing required variables', () => {
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;
      delete process.env.GOOGLE_CLOUD_KEY_FILE;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('GOOGLE_CLOUD_PROJECT_ID'));
      expect(result.errors).toContain(expect.stringContaining('GOOGLE_CLOUD_KEY_FILE'));
    });

    test('should identify missing recommended variables', () => {
      process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';
      process.env.GOOGLE_CLOUD_KEY_FILE = 'test-key.json';
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.CORS_ORIGIN;

      const result = validateEnvironmentConfig();

      expect(result.isValid).toBe(true); // Should still be valid
      expect(result.warnings).toContain(expect.stringContaining('NODE_ENV'));
      expect(result.warnings).toContain(expect.stringContaining('PORT'));
      expect(result.warnings).toContain(expect.stringContaining('CORS_ORIGIN'));
    });
  });

  describe('sanitizeResponseData', () => {
    test('should sanitize successful response data', () => {
      const data = {
        success: true,
        data: { score: 85, message: 'Test message' },
        error: null
      };

      const sanitized = sanitizeResponseData(data);

      expect(sanitized.success).toBe(true);
      expect(sanitized.data).toEqual({ score: 85, message: 'Test message' });
      expect(sanitized.error).toBeNull();
    });

    test('should sanitize error response data', () => {
      const data = {
        success: false,
        data: null,
        error: { code: 'TEST_ERROR', message: 'Test error' }
      };

      const sanitized = sanitizeResponseData(data);

      expect(sanitized.success).toBe(false);
      expect(sanitized.data).toBeNull();
      expect(sanitized.error).toEqual({ code: 'TEST_ERROR', message: 'Test error' });
    });

    test('should throw error for invalid data', () => {
      expect(() => sanitizeResponseData(null)).toThrow('Invalid response data');
      expect(() => sanitizeResponseData('string')).toThrow('Invalid response data');
      expect(() => sanitizeResponseData(123)).toThrow('Invalid response data');
    });

    test('should throw error for success response without data', () => {
      const data = {
        success: true,
        error: null
      };

      expect(() => sanitizeResponseData(data)).toThrow('Success response must include data field');
    });

    test('should throw error for error response without error field', () => {
      const data = {
        success: false,
        data: null
      };

      expect(() => sanitizeResponseData(data)).toThrow('Error response must include error field');
    });
  });

  describe('createErrorResponse', () => {
    test('should create standardized error response', () => {
      const response = createErrorResponse('TEST_ERROR', 'Test error message', { extra: 'data' });

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.message).toBe('Test error message');
      expect(response.error.extra).toBe('data');
      expect(response.error.timestamp).toBeDefined();
    });

    test('should uppercase error codes', () => {
      const response = createErrorResponse('test_error', 'Test message');

      expect(response.error.code).toBe('TEST_ERROR');
    });

    test('should handle metadata', () => {
      const metadata = { requestId: 'req_123', processingTime: 1500 };
      const response = createErrorResponse('TEST_ERROR', 'Test message', metadata);

      expect(response.error.requestId).toBe('req_123');
      expect(response.error.processingTime).toBe(1500);
    });
  });

  describe('createSuccessResponse', () => {
    test('should create standardized success response', () => {
      const data = { score: 85, message: 'Success' };
      const metadata = { processingTime: 1200 };
      const response = createSuccessResponse(data, metadata);

      expect(response.success).toBe(true);
      expect(response.data.score).toBe(85);
      expect(response.data.message).toBe('Success');
      expect(response.data.processingTime).toBe(1200);
    });

    test('should handle empty metadata', () => {
      const data = { score: 85 };
      const response = createSuccessResponse(data);

      expect(response.success).toBe(true);
      expect(response.data.score).toBe(85);
    });

    test('should merge data and metadata', () => {
      const data = { score: 85 };
      const metadata = { metadata: { timestamp: '2023-01-01' } };
      const response = createSuccessResponse(data, metadata);

      expect(response.data.score).toBe(85);
      expect(response.data.metadata.timestamp).toBe('2023-01-01');
    });
  });
});