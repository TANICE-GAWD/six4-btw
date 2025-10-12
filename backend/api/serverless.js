const express = require('express');

// Use serverless-friendly config
const config = require('../src/config/serverless-environment');

const app = express();

// Import security middleware
let securityMiddleware;
try {
  const security = require('../src/middleware/security');
  securityMiddleware = security;
  
  // Apply security headers
  app.use(security.securityHeaders);
  app.use(security.additionalSecurityMiddleware);
  
  console.log('✅ Security middleware loaded');
} catch (error) {
  console.error('❌ Failed to load security middleware:', error.message);
}

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS middleware (simplified)
app.use((req, res, next) => {
  const allowedOrigins = config.cors.origin;
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Simple root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Image Rating API - Serverless Mode',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    endpoints: {
      health: '/health',
      debug: '/api/debug',
      status: '/api/status'
    }
  });
});

// Health check endpoint (simplified)
app.get('/health', (req, res) => {
  try {
    const envValidation = config.getValidationStatus();
    const runtimeValidation = config.validateRuntimeConfig();
    
    const isHealthy = envValidation.isValid && runtimeValidation.isValid;
    
    const healthData = {
      status: isHealthy ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      serverless: true,
      configuration: {
        status: envValidation.isValid ? 'OK' : 'ERROR',
        errors: envValidation.errors,
        warnings: envValidation.warnings
      },
      runtime: {
        status: runtimeValidation.isValid ? 'OK' : 'ERROR',
        errors: runtimeValidation.errors
      },
      credentials: {
        hasProjectId: !!config.googleCloud.projectId,
        hasCredentials: !!(config.googleCloud.credentialsJson || config.googleCloud.keyFile),
        type: config.googleCloud.credentialsJson ? 'JSON' : 'FILE'
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
        message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Import and initialize services and routes
let apiRoutes;
let servicesInitialized = false;

async function initializeServerlessServices() {
  if (servicesInitialized) return true;
  
  try {
    // Initialize services
    const { initializeServices } = require('../src/services');
    const serviceStatus = await initializeServices();
    
    if (!serviceStatus.success) {
      console.error('❌ Failed to initialize services:', serviceStatus.error);
      return false;
    }
    
    console.log('✅ Services initialized successfully');
    servicesInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Service initialization error:', error.message);
    return false;
  }
}

try {
  // Import API routes
  apiRoutes = require('../src/routes/api');
  
  // Middleware to ensure services are initialized before handling API requests
  app.use('/api', async (req, res, next) => {
    if (!servicesInitialized) {
      const initialized = await initializeServerlessServices();
      if (!initialized) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_INITIALIZATION_FAILED',
            message: 'Services could not be initialized'
          }
        });
      }
    }
    next();
  });
  
  // Mount API routes
  app.use('/api', apiRoutes);
  
  console.log('✅ API routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load API routes:', error.message);
  
  // Fallback API endpoints if full routes fail to load
  app.get('/api/status', (req, res) => {
    res.json({
      success: true,
      message: 'API is running in serverless mode (fallback)',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      error: 'Full API routes failed to load: ' + error.message
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'API is running (fallback mode)',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      path: req.originalUrl,
      availableEndpoints: [
        '/',
        '/health',
        '/api/health',
        '/api/status',
        '/api/rate',
        '/api/vision/health',
        '/api/vision/test'
      ]
    }
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;