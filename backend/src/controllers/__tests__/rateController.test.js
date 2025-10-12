/**
 * Unit tests for rateController
 * Tests API endpoint responses and error cases
 * 
 * Requirements fulfilled:
 * - 12.3-12.6: Test API endpoint responses and error cases
 */

const request = require('supertest');
const express = require('express');
const rateController = require('../rateController');


jest.mock('../../services', () => ({
  getVisionService: jest.fn(),
  getRatingService: jest.fn()
}));

jest.mock('../../utils/validation', () => ({
  validateImageFile: jest.fn(),
  createErrorResponse: jest.fn(),
  createSuccessResponse: jest.fn()
}));

const { getVisionService, getRatingService } = require('../../services');
const { validateImageFile, createErrorResponse, createSuccessResponse } = require('../../utils/validation');

describe('rateController', () => {
  let app;
  let mockVisionService;
  let mockRatingService;

  beforeEach(() => {
    
    app = express();
    app.use(express.json());
    
    
    app.use((req, res, next) => {
      req.file = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg',
        size: 1024,
        originalname: 'test.jpg'
      };
      next();
    });
    
    app.post('/api/rate', rateController.rateImage);

    
    mockVisionService = {
      isReady: jest.fn().mockReturnValue(true),
      analyzeImage: jest.fn()
    };

    mockRatingService = {
      validateConfiguration: jest.fn().mockReturnValue({ isValid: true }),
      calculateRating: jest.fn()
    };

    getVisionService.mockReturnValue(mockVisionService);
    getRatingService.mockReturnValue(mockRatingService);

    
    validateImageFile.mockReturnValue({
      isValid: true,
      errors: [],
      fileInfo: { size: 1024, type: 'image/jpeg', originalName: 'test.jpg' }
    });

    createErrorResponse.mockImplementation((code, message, metadata) => ({
      success: false,
      error: { code, message, ...metadata }
    }));

    createSuccessResponse.mockImplementation((data, metadata) => ({
      success: true,
      data: { ...data, ...metadata }
    }));

    
    jest.clearAllMocks();
  });

  describe('POST /api/rate', () => {
    test('should successfully process image and return rating', async () => {
      const mockLabels = [
        { description: 'matcha', score: 0.95, topicality: 0.95 },
        { description: 'tote bag', score: 0.88, topicality: 0.90 }
      ];

      const mockRatingResult = {
        score: 27,
        message: 'Quite performative!',
        detectedItems: [
          { item: 'matcha', points: 15, confidence: 0.95 },
          { item: 'tote bag', points: 12, confidence: 0.88 }
        ]
      };

      mockVisionService.analyzeImage.mockResolvedValue(mockLabels);
      mockRatingService.calculateRating.mockReturnValue(mockRatingResult);

      const response = await request(app)
        .post('/api/rate')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(createSuccessResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          score: 27,
          message: 'Quite performative!',
          detectedItems: expect.arrayContaining([
            expect.objectContaining({ item: 'matcha', points: 15 }),
            expect.objectContaining({ item: 'tote bag', points: 12 })
          ])
        }),
        expect.objectContaining({
          metadata: expect.objectContaining({
            imageSize: 1024,
            imageType: 'image/jpeg',
            totalLabelsFound: 2,
            performativeItemsDetected: 2
          })
        })
      );
    });

    test('should return 400 for invalid file', async () => {
      validateImageFile.mockReturnValue({
        isValid: false,
        errors: ['Invalid file type'],
        fileInfo: { size: 1024, type: 'text/plain' }
      });

      const response = await request(app)
        .post('/api/rate')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(createErrorResponse).toHaveBeenCalledWith(
        'INVALID_FILE',
        'Invalid file type',
        expect.objectContaining({
          processingTime: expect.any(Number),
          fileInfo: expect.objectContaining({ size: 1024, type: 'text/plain' })
        })
      );
    });

    test('should return 503 when vision service is not ready', async () => {
      mockVisionService.isReady.mockReturnValue(false);

      const response = await request(app)
        .post('/api/rate')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(createErrorResponse).toHaveBeenCalledWith(
        'SERVICE_UNAVAILABLE',
        'Vision service is not available',
        expect.objectContaining({
          processingTime: expect.any(Number),
          service: 'vision'
        })
      );
    });

    test('should return 503 when rating service is not configured', async () => {
      mockRatingService.validateConfiguration.mockReturnValue({
        isValid: false,
        errors: ['Missing configuration']
      });

      const response = await request(app)
        .post('/api/rate')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(createErrorResponse).toHaveBeenCalledWith(
        'SERVICE_UNAVAILABLE',
        'Rating service is not properly configured',
        expect.objectContaining({
          processingTime: expect.any(Number),
          service: 'rating'
        })
      );
    });

    test('should handle vision service errors', async () => {
      const visionError = new Error('Vision API error');
      visionError.code = 'VISION_TIMEOUT';
      mockVisionService.analyzeImage.mockRejectedValue(visionError);

      const response = await request(app)
        .post('/api/rate')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(createErrorResponse).toHaveBeenCalledWith(
        'VISION_TIMEOUT',
        'Vision API error',
        expect.objectContaining({
          processingTime: expect.any(Number)
        })
      );
    });

    test('should handle rating service errors', async () => {
      mockVisionService.analyzeImage.mockResolvedValue([]);
      mockRatingService.calculateRating.mockImplementation(() => {
        throw new Error('Labels must be an array');
      });

      const response = await request(app)
        .post('/api/rate')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(createErrorResponse).toHaveBeenCalledWith(
        'RATING_ERROR',
        'Unable to process image analysis results',
        expect.objectContaining({
          processingTime: expect.any(Number)
        })
      );
    });

    test('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockVisionService.analyzeImage.mockRejectedValue(unexpectedError);

      
      const mockNext = jest.fn();
      const mockReq = { file: { buffer: Buffer.from('test'), size: 1024, mimetype: 'image/jpeg' } };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await rateController.rateImage(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });

    test('should include processing time in response', async () => {
      const mockLabels = [{ description: 'test', score: 0.95, topicality: 0.95 }];
      const mockRatingResult = {
        score: 15,
        message: 'Slightly performative',
        detectedItems: [{ item: 'test', points: 15, confidence: 0.95 }]
      };

      mockVisionService.analyzeImage.mockResolvedValue(mockLabels);
      mockRatingService.calculateRating.mockReturnValue(mockRatingResult);

      await request(app)
        .post('/api/rate')
        .expect(200);

      expect(createSuccessResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          processingTime: expect.any(Number)
        }),
        expect.any(Object)
      );
    });

    test('should log processing information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const mockLabels = [{ description: 'test', score: 0.95, topicality: 0.95 }];
      const mockRatingResult = {
        score: 15,
        message: 'Test message',
        detectedItems: [{ item: 'test', points: 15, confidence: 0.95 }]
      };

      mockVisionService.analyzeImage.mockResolvedValue(mockLabels);
      mockRatingService.calculateRating.mockReturnValue(mockRatingResult);

      await request(app)
        .post('/api/rate')
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing image rating request')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Vision API analysis completed')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Image rating completed successfully')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('testVisionService', () => {
    beforeEach(() => {
      app.post('/api/test-vision', rateController.testVisionService);
    });

    test('should successfully test vision service', async () => {
      const mockLabels = [
        { description: 'test', score: 0.95, topicality: 0.95 }
      ];

      mockVisionService.analyzeImage.mockResolvedValue(mockLabels);

      const response = await request(app)
        .post('/api/test-vision')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.detectedLabels).toHaveLength(1);
      expect(response.body.data.detectedLabels[0]).toMatchObject({
        description: 'test',
        confidence: 0.95,
        topicality: 0.95
      });
    });

    test('should return 400 when no file provided', async () => {
      
      app.use((req, res, next) => {
        req.file = null;
        next();
      });
      app.post('/api/test-vision-no-file', rateController.testVisionService);

      const response = await request(app)
        .post('/api/test-vision-no-file')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_FILE');
    });

    test('should return 503 when vision service not ready', async () => {
      mockVisionService.isReady.mockReturnValue(false);

      const response = await request(app)
        .post('/api/test-vision')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('getVisionHealth', () => {
    beforeEach(() => {
      app.get('/api/vision-health', rateController.getVisionHealth);
    });

    test('should return vision service health status', async () => {
      const mockHealthStatus = {
        isReady: true,
        hasCredentials: true,
        hasProjectId: true,
        maxRetries: 3,
        timeout: 30000
      };

      mockVisionService.getHealthStatus.mockReturnValue(mockHealthStatus);

      const response = await request(app)
        .get('/api/vision-health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service).toBe('vision');
      expect(response.body.data.isReady).toBe(true);
      expect(response.body.data.timestamp).toBeDefined();
    });

    test('should handle health check failure', async () => {
      mockVisionService.getHealthStatus.mockImplementation(() => {
        throw new Error('Health check failed');
      });

      const response = await request(app)
        .get('/api/vision-health')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('HEALTH_CHECK_FAILED');
    });
  });
});