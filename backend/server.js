const express = require('express');
const config = require('./src/config/environment');

// Import services
const { initializeServices } = require('./src/services');

// Import middleware
const corsMiddleware = require('./src/middleware/cors');
const errorHandler = require('./src/middleware/errorHandler');
const { securityHeaders, rateLimiter, additionalSecurityMiddleware } = require('./src/middleware/security');
const { requestLogger, errorRequestLogger, performanceLogger } = require('./src/middleware/logging');

// Import routes
const apiRoutes = require('./src/routes/api');

const app = express();

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

// Health check endpoint with comprehensive system status
app.get('/health', async (req, res) => {
  try {
    const { getVisionService, getRatingService } = require('./src/services');
    
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
      version: require('./package.json').version,
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

// Initialize services and start server
async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Validate environment configuration
    const envValidation = config.getValidationStatus();
    if (!envValidation.isValid) {
      console.error('Environment validation failed:', envValidation.errors);
      process.exit(1);
    }
    
    // Validate runtime configuration
    const runtimeValidation = config.validateRuntimeConfig();
    if (!runtimeValidation.isValid) {
      console.error('Runtime configuration validation failed:', runtimeValidation.errors);
      if (config.nodeEnv === 'production') {
        process.exit(1);
      } else {
        console.warn('Continuing with runtime validation errors in development mode');
      }
    }
    
    // Initialize all services
    const serviceStatus = await initializeServices();
    
    if (!serviceStatus.success) {
      console.error('Failed to initialize services:', serviceStatus.error);
      process.exit(1);
    }
    
    console.log('Services initialized successfully:', serviceStatus.services);
    
    // Start server
    const server = app.listen(config.port, () => {
      console.log(`✅ Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`✅ CORS origin: ${config.cors.origin}`);
      console.log(`✅ Max file size: ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`);
      console.log(`✅ Allowed file types: ${config.upload.allowedTypes.join(', ')}`);
      console.log(`✅ Request logging: ${config.logging.enableRequestLogging ? 'enabled' : 'disabled'}`);
      console.log(`✅ Performance logging: ${config.logging.enablePerformanceLogging ? 'enabled' : 'disabled'}`);
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (error.stack && config.nodeEnv === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Start the server
const serverPromise = startServer();

// Enhanced graceful shutdown with timeout
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  
  try {
    const server = await serverPromise;
    
    // Set a timeout for graceful shutdown
    const shutdownTimeout = setTimeout(() => {
      console.error('Graceful shutdown timeout exceeded, forcing exit');
      process.exit(1);
    }, config.process.gracefulShutdownTimeout);
    
    // Close server and cleanup
    server.close(async () => {
      clearTimeout(shutdownTimeout);
      
      try {
        // Cleanup services if needed
        const { cleanupServices } = require('./src/services');
        await cleanupServices();
        
        console.log('✅ HTTP server closed and services cleaned up');
        process.exit(0);
      } catch (cleanupError) {
        console.error('Error during service cleanup:', cleanupError.message);
        process.exit(1);
      }
    });
    
    // Stop accepting new connections immediately
    server.closeAllConnections?.();
    
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;