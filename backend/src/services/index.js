const VisionService = require('./visionService');
const RatingService = require('./ratingService');


let visionServiceInstance = null;
let ratingServiceInstance = null;

/**
 * Get or create vision service instance
 * @returns {VisionService} Vision service instance
 */
function getVisionService() {
  if (!visionServiceInstance) {
    visionServiceInstance = new VisionService();
  }
  return visionServiceInstance;
}

/**
 * Get or create rating service instance
 * @returns {RatingService} Rating service instance
 */
function getRatingService() {
  if (!ratingServiceInstance) {
    ratingServiceInstance = new RatingService();
  }
  return ratingServiceInstance;
}

/**
 * Initialize all services and validate configuration
 * @returns {Promise<Object>} Service initialization status
 */
async function initializeServices() {
  try {
    const visionService = getVisionService();
    const ratingService = getRatingService();
    
    const visionHealthStatus = visionService.getHealthStatus();
    const ratingValidation = ratingService.validateConfiguration();
    
    if (!visionHealthStatus.isReady) {
      throw new Error('Vision service failed to initialize');
    }
    
    if (!ratingValidation.isValid) {
      throw new Error('Rating service configuration is invalid');
    }
    
    console.log('All services initialized successfully');
    return {
      success: true,
      services: {
        vision: visionHealthStatus,
        rating: ratingValidation
      }
    };
  } catch (error) {
    console.error('Service initialization failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cleanup all services during graceful shutdown
 * @returns {Promise<void>}
 */
async function cleanupServices() {
  try {
    console.log('Cleaning up services...');
    
    
    if (visionServiceInstance && typeof visionServiceInstance.cleanup === 'function') {
      await visionServiceInstance.cleanup();
    }
    
    
    if (ratingServiceInstance && typeof ratingServiceInstance.cleanup === 'function') {
      await ratingServiceInstance.cleanup();
    }
    
    
    visionServiceInstance = null;
    ratingServiceInstance = null;
    
    console.log('Services cleanup completed');
  } catch (error) {
    console.error('Error during service cleanup:', error.message);
    throw error;
  }
}

module.exports = {
  getVisionService,
  getRatingService,
  initializeServices,
  cleanupServices
};