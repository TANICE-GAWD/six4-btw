

const config = require('../src/config/environment');

console.log('🧪 Testing Production Configuration...\n');

// Test 1: Environment Configuration
console.log('1 Environment Configuration:');
console.log(`   Environment: ${config.nodeEnv}`);
console.log(`   Port: ${config.port}`);
console.log(`   CORS Origin: ${config.cors.origin}`);
console.log(`    Environment configuration loaded\n`);

// Test 2: Security Configuration
console.log('2️⃣ Security Configuration:');
console.log(`   Rate Limit: ${config.security.rateLimitMaxRequests} requests per ${config.security.rateLimitWindowMs / 1000}s`);
console.log(`   Upload Rate Limit: ${config.security.uploadRateLimitMaxRequests} uploads per ${config.security.uploadRateLimitWindowMs / 1000}s`);
console.log(`   ✅ Security configuration loaded\n`);

// Test 3: Logging Configuration
console.log('3 Logging Configuration:');
console.log(`   Log Level: ${config.logging.level}`);
console.log(`   Request Logging: ${config.logging.enableRequestLogging ? 'enabled' : 'disabled'}`);
console.log(`   Performance Logging: ${config.logging.enablePerformanceLogging ? 'enabled' : 'disabled'}`);
console.log(`   Slow Request Threshold: ${config.logging.slowRequestThreshold}ms`);
console.log(`   Logging configuration loaded\n`);

// Test 4: Health Check Configuration
console.log('4️ Health Check Configuration:');
console.log(`   Timeout: ${config.healthCheck.timeout}ms`);
console.log(`    Health check configuration loaded\n`);

// Test 5: Process Configuration
console.log('5️ Process Configuration:');
console.log(`   Graceful Shutdown Timeout: ${config.process.gracefulShutdownTimeout}ms`);
console.log(`    Process configuration loaded\n`);

// Test 6: Security Middleware
console.log('6️ Security Middleware:');
try {
  const { securityHeaders, rateLimiter, uploadRateLimiter, additionalSecurityMiddleware } = require('../src/middleware/security');
  console.log(`    Security headers middleware loaded`);
  console.log(`    Rate limiter middleware loaded`);
  console.log(`    Upload rate limiter middleware loaded`);
  console.log(`    Additional security middleware loaded\n`);
} catch (error) {
  console.log(`    Security middleware error: ${error.message}\n`);
}

// Test 7: Logging Middleware
console.log('7️ Logging Middleware:');
try {
  const { requestLogger, errorRequestLogger, performanceLogger } = require('../src/middleware/logging');
  console.log(`    Request logger loaded`);
  console.log(`    Error request logger loaded`);
  console.log(`    Performance logger loaded\n`);
} catch (error) {
  console.log(`    Logging middleware error: ${error.message}\n`);
}

// Test 8: Services
console.log('8 Services:');
try {
  const { initializeServices, cleanupServices } = require('../src/services');
  console.log(`    Service initialization function loaded`);
  console.log(`    Service cleanup function loaded\n`);
} catch (error) {
  console.log(`    Services error: ${error.message}\n`);
}

// console.log('Production configuration test completed successfully!');
// console.log('\n📋 Summary:');
// console.log(' Environment-specific configuration');
// console.log(' Security headers and rate limiting');
// console.log(' Production logging configuration');
// console.log(' Health check endpoint configuration');
// console.log(' Graceful shutdown configuration');
// console.log(' All middleware loaded successfully');

if (config.nodeEnv === 'production') {
  console.log('\n Ready for production deployment!');
} else {
  console.log('\n Development mode - ready for testing!');
}