const { getVisionService, getRatingService } = require('../services');
const { validateImageFile, createErrorResponse, createSuccessResponse } = require('../utils/validation');

/**
 * Main image rating controller - processes uploaded images and returns performative ratings
 * 
 * Implements the complete workflow:
 * 1. Input validation (file presence, type, size)
 * 2. Service availability checks
 * 3. Google Cloud Vision API analysis
 * 4. Performative rating calculation
 * 5. Structured response generation
 * 
 * Middleware chain: uploadRateLimiter → uploadMiddleware → rateImage
 * 
 * @param {Object} req - Express request object (expects req.file from multer)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * 
 * Requirements fulfilled:
 * - 12.1: POST /api/rate endpoint for image rating
 * - 12.2: Expects multipart/form-data with 'image' field
 * - 12.3: Returns JSON with score, message, and detectedItems fields
 * - 12.4: Returns 400 status with specific error messages for validation failures
 * - 12.5: Returns 500 status with generic error messages for server errors
 * - 12.6: Includes appropriate HTTP status codes and Content-Type headers
 */
async function rateImage(req, res, next) {
  const startTime = Date.now();
  
  try {
    
    const fileValidation = validateImageFile(req.file);
    
    if (!fileValidation.isValid) {
      console.log('File validation failed:', fileValidation.errors);
      return res.status(400).json(
        createErrorResponse(
          'INVALID_FILE',
          fileValidation.errors.join('; '),
          { 
            processingTime: Date.now() - startTime,
            fileInfo: fileValidation.fileInfo 
          }
        )
      );
    }

    
    const visionService = getVisionService();
    const ratingService = getRatingService();
    
    
    if (!visionService.isReady()) {
      return res.status(503).json(
        createErrorResponse(
          'SERVICE_UNAVAILABLE',
          'Vision service is not available',
          { 
            processingTime: Date.now() - startTime,
            service: 'vision'
          }
        )
      );
    }

    
    const ratingValidation = ratingService.validateConfiguration();
    if (!ratingValidation.isValid) {
      return res.status(503).json(
        createErrorResponse(
          'SERVICE_UNAVAILABLE',
          'Rating service is not properly configured',
          { 
            processingTime: Date.now() - startTime,
            service: 'rating'
          }
        )
      );
    }

    
    console.log(`Processing image rating request - Size: ${req.file.size} bytes, Type: ${req.file.mimetype}`);
    
    
    const visionStartTime = Date.now();
    const visionResults = await visionService.analyzeImage(req.file.buffer);
    const visionProcessingTime = Date.now() - visionStartTime;
    
    const labels = visionResults.labels || [];
    const textAnnotations = visionResults.textAnnotations || [];
    
    console.log(`Vision API analysis completed in ${visionProcessingTime}ms, found ${labels.length} labels and ${textAnnotations.length} text annotations`);
    console.log('Detected labels:', labels.map(label => `"${label.description}" (${(label.score * 100).toFixed(1)}%)`).join(', '));
    if (textAnnotations.length > 0) {
      console.log('Detected text:', textAnnotations.map(text => `"${text.description}"`).join(', '));
    }
    
    
    const ratingStartTime = Date.now();
    const ratingResult = ratingService.calculateRating(labels, { textAnnotations });
    const ratingProcessingTime = Date.now() - ratingStartTime;
    
    
    const totalProcessingTime = Date.now() - startTime;
    
    
    const responseData = {
      score: ratingResult.score,
      message: ratingResult.message,
      detectedItems: ratingResult.detectedItems.map(item => ({
        item: item.item,
        points: item.points,
        confidence: item.confidence
      })),
      processingTime: totalProcessingTime
    };

    const responseMetadata = {
      imageSize: req.file.size,
      imageType: req.file.mimetype,
      totalLabelsFound: labels.length,
      totalTextAnnotations: textAnnotations.length,
      performativeItemsDetected: ratingResult.detectedItems.length,
      visionProcessingTime: visionProcessingTime,
      ratingProcessingTime: ratingProcessingTime,
      timestamp: new Date().toISOString()
    };

    const response = createSuccessResponse(responseData, { metadata: responseMetadata });

    
    console.log(`Image rating completed successfully - Score: ${ratingResult.score}, Processing time: ${totalProcessingTime}ms`);
    
    
    res.status(200).json(response);

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Image rating error:', error.message, `(after ${processingTime}ms)`);
    
    
    if (error.code && error.code.startsWith('VISION_')) {
      return res.status(503).json(
        createErrorResponse(
          error.code,
          error.message,
          { processingTime: processingTime }
        )
      );
    }
    
    
    if (error.message.includes('Labels must be an array')) {
      return res.status(500).json(
        createErrorResponse(
          'RATING_ERROR',
          'Unable to process image analysis results',
          { processingTime: processingTime }
        )
      );
    }
    
    
    next(error);
  }
}

/**
 * Test endpoint to verify vision service integration
 * This is a basic implementation to test the vision service
 * The full rating logic will be implemented in task 18
 */
async function testVisionService(req, res, next) {
  try {
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No image file provided'
        }
      });
    }

    const visionService = getVisionService();
    
    
    if (!visionService.isReady()) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Vision service is not available'
        }
      });
    }

    const startTime = Date.now();
    
    
    const visionResults = await visionService.analyzeImage(req.file.buffer);
    
    const processingTime = Date.now() - startTime;
    
    const labels = visionResults.labels || [];
    const textAnnotations = visionResults.textAnnotations || [];
    
    
    res.json({
      success: true,
      data: {
        message: 'Image analyzed successfully',
        detectedLabels: labels.map(label => ({
          description: label.description,
          confidence: label.score,
          topicality: label.topicality
        })),
        detectedText: textAnnotations.map(text => ({
          description: text.description,
          confidence: text.confidence || 0.9
        })),
        processingTime,
        imageSize: req.file.size,
        imageType: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Vision service test error:', error);
    
    
    if (error.code && error.code.startsWith('VISION_')) {
      return res.status(503).json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      });
    }
    
    
    next(error);
  }
}

/**
 * Get vision service health status
 */
function getVisionHealth(req, res) {
  try {
    const visionService = getVisionService();
    const healthStatus = visionService.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        service: 'vision',
        ...healthStatus,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Unable to check vision service health'
      }
    });
  }
}

module.exports = {
  rateImage,
  testVisionService,
  getVisionHealth
};