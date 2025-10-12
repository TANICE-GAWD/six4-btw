const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('../config/environment');

/**
 * Security middleware for production deployment
 * Implements comprehensive security headers and rate limiting
 * 
 * Requirements fulfilled:
 * - 8.4: Maintain stateless operation for scalability
 * - 13.6: Restrict allowed origins based on environment settings
 */


const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, 
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
});


const rateLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req, res) => {
    const { logSecurityEvent } = require('./logging');
    logSecurityEvent('RATE_LIMIT_EXCEEDED', req, {
      windowMs: config.security.rateLimitWindowMs,
      maxRequests: config.security.rateLimitMaxRequests
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later'
      }
    });
  }
});


const uploadRateLimiter = rateLimit({
  windowMs: config.security.uploadRateLimitWindowMs,
  max: config.security.uploadRateLimitMaxRequests,
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const { logSecurityEvent } = require('./logging');
    logSecurityEvent('UPLOAD_RATE_LIMIT_EXCEEDED', req, {
      windowMs: config.security.uploadRateLimitWindowMs,
      maxRequests: config.security.uploadRateLimitMaxRequests
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Too many upload attempts, please try again later'
      }
    });
  }
});

/**
 * Additional security middleware for production
 */
const additionalSecurityMiddleware = (req, res, next) => {
  
  res.removeHeader('X-Powered-By');
  
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  
  if (req.path.includes('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

module.exports = {
  securityHeaders,
  rateLimiter,
  uploadRateLimiter,
  additionalSecurityMiddleware
};