const express = require('express');
const config = require('../src/config/environment');

// Import services
const { initializeServices } = require('../src/services');

// Import middleware
const corsMiddleware = require('../src/middleware/cors');
const errorHandler = require('../src/middleware/errorHandler');
const { securityHeaders, rateLimiter, additionalSecurityMiddleware } = require('../src/middleware/security');
const { requestLogger, errorRequestLogger, performanceLogger } = require('../src/middleware/logging');

// Import routes
const apiRoutes = require('../src/routes/api');

const app = express();

// Global variable to track initialization
let servicesInitialized = false;
let initializationPromise = null;

// Initialize services once (serverless function reuse)
async function ensureServicesInitialized() {
  if (servicesInitialized) {
    return;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      console.log('Initializing services for serverless function...');
      
      // Validate environment configuration
      const envValidation = config.getValidationStatus();
      if (!envValidation.isValid) {
        console.error('Environment validation failed:', envValidation.errors);
        throw new Error('Environment validation failed');
      }
      
      // Validate runtime configuration (more lenient in serverless)
      const runtimeValidation = config.validateRuntimeConfig();
      if (!runtimeValidation.isValid) {
        console.warn('Runtime configuration validation failed:', runtimeValidation.errors);
        // Don't fail in serverless environment, just warn
      }
      
      // Initialize all services
      const serviceStatus = await initializeServices();
      
      if (!serviceStatus.success) {
        console.error('Failed to initialize services:', serviceStatus.error);
        throw new Error('Service initialization failed');
      }
      
      console.log('Services initialized successfully:', serviceStatus.services);
      servicesInitialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize services:', error.message);
      initializationPromise = null; // Reset so we can retry
      throw error;
    }
  })();
  
  return initializationPromise;
}

// Security middleware (should be first)
app.use(securityHeaders);
app.use(additionalSecurityMiddleware);

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(rateLimiter);

// Request parsing middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 encoded images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
if (config.logging.enableRequestLogging) {
  app.use(requestLogger);
}

if (config.logging.enablePerformanceLogging) {
  app.use(performanceLogger(config.logging.slowRequestThreshold));
}

// Error request logging (before error handler)
app.use(errorRequestLogger);

// Simple root endpoint (no service initialization required)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Image Rating API - Serverless',
    version: require('../package.json').version,
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api/*'
    }
  });
});

// Middleware to ensure services are initialized (only for API routes)
app.use('/api', async (req, res, next) => {
  try {
    await ensureServicesInitialized();
    next();
  } catch (error) {
    console.error('Service initialization failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_INITIALIZATION_FAILED',
        message: 'Services are not available',
        details: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Health check endpoint with comprehensive system status
app.get('/health', async (req, res) => {
  try {
    const { getVisionService, getRatingService } = require('../src/services');
    
    // Get service health status
    const visionService = getVisionService();
    const ratingService = getRatingService();
    
    const visionHealth = visionService.getHealthStatus();
    const ratingValidation = ratingService.validateConfiguration();
    const envValidation = config.getValidationStatus();
    
    // Determine overall health
    const isHealthy = visionHealth.isReady && 
                     ratingValidation.isValid && 
                     envValidation.isValid;
    
    const healthData = {
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
      version: require('../package.json').version,
      serverless: true,
      servicesInitialized,
      services: {
        vision: {
          status: visionHealth.isReady ? 'OK' : 'ERROR',
          ...visionHealth
        },
        rating: {
          status: ratingValidation.isValid ? 'OK' : 'ERROR',
          ...ratingValidation
        }
      },
      configuration: {
        status: envValidation.isValid ? 'OK' : 'ERROR',
        errors: envValidation.errors,
        warnings: envValidation.warnings
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      }
    };
    
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json({
      success: isHealthy,
      data: healthData
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Unable to determine system health',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Global error handling middleware (should be last)
app.use(errorHandler);

// Export the Express app for Vercel
module.exports = app;