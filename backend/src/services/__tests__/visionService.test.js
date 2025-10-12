/**
 * Unit tests for VisionService
 * Tests Google Cloud Vision service integration with mocked responses
 * 
 * Requirements fulfilled:
 * - 10.4: Test Google Cloud Vision service integration with mocked responses
 */

const VisionService = require('../visionService');

// Mock Google Cloud Vision client
jest.mock('@google-cloud/vision', () => {
  return {
    ImageAnnotatorClient: jest.fn().mockImplementation(() => ({
      annotateImage: jest.fn()
    }))
  };
});

describe('VisionService', () => {
  let visionService;
  let mockClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    visionService = new VisionService();
    mockClient = visionService.client;
  });

  describe('constructor', () => {
    test('should initialize with default configuration', () => {
      expect(visionService.maxRetries).toBe(3);
      expect(visionService.retryDelay).toBe(1000);
      expect(visionService.timeout).toBe(30000);
      expect(visionService.circuitBreaker.state).toBe('CLOSED');
    });
  });

  describe('analyzeImage', () => {
    test('should successfully analyze image and return labels', async () => {
      const mockLabels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 },
        { description: 'tote bag', score: 0.88, topicality: 0.90 }
      ];

      mockClient.annotateImage.mockResolvedValue([{
        labelAnnotations: mockLabels
      }]);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await visionService.analyzeImage(imageBuffer);

      expect(result).toEqual(mockLabels);
      expect(mockClient.annotateImage).toHaveBeenCalledWith({
        image: { content: imageBuffer.toString('base64') },
        features: [{ type: 'LABEL_DETECTION', maxResults: 20 }]
      });
    });

    test('should return empty array when no labels found', async () => {
      mockClient.annotateImage.mockResolvedValue([{}]);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await visionService.analyzeImage(imageBuffer);

      expect(result).toEqual([]);
    });

    test('should throw error for invalid image buffer', async () => {
      await expect(visionService.analyzeImage(null)).rejects.toThrow('Invalid image buffer provided');
      await expect(visionService.analyzeImage('not-a-buffer')).rejects.toThrow('Invalid image buffer provided');
      await expect(visionService.analyzeImage({})).rejects.toThrow('Invalid image buffer provided');
    });

    test('should throw error when client not initialized', async () => {
      visionService.client = null;
      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow('Vision client not initialized');
    });

    test('should handle Vision API timeout', async () => {
      // Mock a timeout scenario
      mockClient.annotateImage.mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 35000)) // Longer than timeout
      );

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow();
    });

    test('should handle Vision API authentication error', async () => {
      const authError = new Error('UNAUTHENTICATED: Invalid credentials');
      authError.code = 'UNAUTHENTICATED';
      mockClient.annotateImage.mockRejectedValue(authError);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow('Vision API authentication failed');
    });

    test('should handle Vision API quota exceeded error', async () => {
      const quotaError = new Error('QUOTA_EXCEEDED: API quota exceeded');
      quotaError.code = 'QUOTA_EXCEEDED';
      mockClient.annotateImage.mockRejectedValue(quotaError);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow('Vision API quota exceeded');
    });

    test('should handle Vision API permission denied error', async () => {
      const permError = new Error('PERMISSION_DENIED: Access denied');
      permError.code = 'PERMISSION_DENIED';
      mockClient.annotateImage.mockRejectedValue(permError);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow('Vision API permission denied');
    });

    test('should retry on transient failures', async () => {
      const transientError = new Error('Temporary service error');
      const mockLabels = [{ description: 'test', score: 0.95, topicality: 0.95 }];

      // First two calls fail, third succeeds
      mockClient.annotateImage
        .mockRejectedValueOnce(transientError)
        .mockRejectedValueOnce(transientError)
        .mockResolvedValue([{ labelAnnotations: mockLabels }]);

      const imageBuffer = Buffer.from('fake-image-data');
      const result = await visionService.analyzeImage(imageBuffer);

      expect(result).toEqual(mockLabels);
      expect(mockClient.annotateImage).toHaveBeenCalledTimes(3);
    });

    test('should not retry on non-retryable errors', async () => {
      const authError = new Error('UNAUTHENTICATED: Invalid credentials');
      authError.code = 'UNAUTHENTICATED';
      mockClient.annotateImage.mockRejectedValue(authError);

      const imageBuffer = Buffer.from('fake-image-data');

      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow();
      expect(mockClient.annotateImage).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('circuit breaker', () => {
    test('should open circuit breaker after failure threshold', async () => {
      const error = new Error('Service error');
      mockClient.annotateImage.mockRejectedValue(error);

      const imageBuffer = Buffer.from('fake-image-data');

      // Trigger failures to reach threshold
      for (let i = 0; i < 5; i++) {
        try {
          await visionService.analyzeImage(imageBuffer);
        } catch (e) {
          // Expected to fail
        }
      }

      expect(visionService.circuitBreaker.state).toBe('OPEN');

      // Next call should fail immediately without calling API
      await expect(visionService.analyzeImage(imageBuffer)).rejects.toThrow('circuit breaker is OPEN');
    });

    test('should transition from OPEN to HALF_OPEN after timeout', async () => {
      // Force circuit breaker to OPEN state
      visionService.circuitBreaker.state = 'OPEN';
      visionService.circuitBreaker.lastFailureTime = Date.now() - 61000; // 61 seconds ago

      const mockLabels = [{ description: 'test', score: 0.95, topicality: 0.95 }];
      mockClient.annotateImage.mockResolvedValue([{ labelAnnotations: mockLabels }]);

      const imageBuffer = Buffer.from('fake-image-data');
      
      // Check circuit breaker state
      const state = visionService.checkCircuitBreaker();
      expect(state).toBe('HALF_OPEN');
    });

    test('should transition from HALF_OPEN to CLOSED after successful calls', async () => {
      // Set circuit breaker to HALF_OPEN
      visionService.circuitBreaker.state = 'HALF_OPEN';
      visionService.circuitBreaker.successCount = 0;

      const mockLabels = [{ description: 'test', score: 0.95, topicality: 0.95 }];
      mockClient.annotateImage.mockResolvedValue([{ labelAnnotations: mockLabels }]);

      const imageBuffer = Buffer.from('fake-image-data');

      // Make successful calls to reach success threshold
      await visionService.analyzeImage(imageBuffer);
      await visionService.analyzeImage(imageBuffer);

      expect(visionService.circuitBreaker.state).toBe('CLOSED');
    });
  });

  describe('isReady', () => {
    test('should return true when client is initialized', () => {
      expect(visionService.isReady()).toBe(true);
    });

    test('should return false when client is not initialized', () => {
      visionService.client = null;
      expect(visionService.isReady()).toBe(false);
    });
  });

  describe('getHealthStatus', () => {
    test('should return comprehensive health status', () => {
      const originalEnv = process.env;
      process.env.GOOGLE_CLOUD_KEY_FILE = 'test-key.json';
      process.env.GOOGLE_CLOUD_PROJECT_ID = 'test-project';

      const health = visionService.getHealthStatus();

      expect(health).toMatchObject({
        isReady: true,
        hasCredentials: true,
        hasProjectId: true,
        maxRetries: 3,
        timeout: 30000,
        circuitBreaker: {
          state: 'CLOSED',
          failureCount: 0,
          failureThreshold: 5
        }
      });

      process.env = originalEnv;
    });

    test('should indicate missing credentials', () => {
      const originalEnv = process.env;
      delete process.env.GOOGLE_CLOUD_KEY_FILE;
      delete process.env.GOOGLE_CLOUD_PROJECT_ID;

      const health = visionService.getHealthStatus();

      expect(health.hasCredentials).toBe(false);
      expect(health.hasProjectId).toBe(false);

      process.env = originalEnv;
    });
  });

  describe('transformError', () => {
    test('should transform timeout errors', () => {
      const timeoutError = new Error('Request timeout');
      const transformed = visionService.transformError(timeoutError);

      expect(transformed.code).toBe('VISION_TIMEOUT');
      expect(transformed.message).toBe('Vision API request timed out');
    });

    test('should transform authentication errors', () => {
      const authError = new Error('UNAUTHENTICATED: Invalid credentials');
      const transformed = visionService.transformError(authError);

      expect(transformed.code).toBe('VISION_AUTH_ERROR');
      expect(transformed.message).toBe('Vision API authentication failed');
    });

    test('should transform quota errors', () => {
      const quotaError = new Error('QUOTA_EXCEEDED: API quota exceeded');
      const transformed = visionService.transformError(quotaError);

      expect(transformed.code).toBe('VISION_QUOTA_ERROR');
      expect(transformed.message).toBe('Vision API quota exceeded');
    });

    test('should transform permission errors', () => {
      const permError = new Error('PERMISSION_DENIED: Access denied');
      const transformed = visionService.transformError(permError);

      expect(transformed.code).toBe('VISION_PERMISSION_ERROR');
      expect(transformed.message).toBe('Vision API permission denied');
    });

    test('should transform generic errors', () => {
      const genericError = new Error('Unknown error');
      const transformed = visionService.transformError(genericError);

      expect(transformed.code).toBe('VISION_SERVICE_ERROR');
      expect(transformed.message).toBe('Vision API service error');
      expect(transformed.originalError).toBe(genericError);
    });
  });

  describe('isNonRetryableError', () => {
    test('should identify non-retryable errors', () => {
      const authError = new Error('UNAUTHENTICATED');
      const quotaError = new Error('QUOTA_EXCEEDED');
      const permError = new Error('PERMISSION_DENIED');
      const invalidError = new Error('INVALID_ARGUMENT');

      expect(visionService.isNonRetryableError(authError)).toBe(true);
      expect(visionService.isNonRetryableError(quotaError)).toBe(true);
      expect(visionService.isNonRetryableError(permError)).toBe(true);
      expect(visionService.isNonRetryableError(invalidError)).toBe(true);
    });

    test('should identify retryable errors', () => {
      const networkError = new Error('Network error');
      const timeoutError = new Error('Timeout');
      const serviceError = new Error('Service unavailable');

      expect(visionService.isNonRetryableError(networkError)).toBe(false);
      expect(visionService.isNonRetryableError(timeoutError)).toBe(false);
      expect(visionService.isNonRetryableError(serviceError)).toBe(false);
    });
  });
});