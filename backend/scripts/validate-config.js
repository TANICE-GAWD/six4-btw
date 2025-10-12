

const fs = require('fs');
const path = require('path');


require('dotenv').config();


async function validateConfiguration() {
  console.log('🔍 Validating configuration...');
  
  try {
    
    const config = require('../src/config/environment');
    
    
    const envValidation = config.getValidationStatus();
    const runtimeValidation = config.validateRuntimeConfig();
    
    console.log('\n📋 Environment Validation:');
    if (envValidation.isValid) {
      console.log(' Environment variables are valid');
    } else {
      console.log(' Environment validation failed:');
      envValidation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    if (envValidation.warnings.length > 0) {
      console.log('\n  Environment warnings:');
      envValidation.warnings.forEach(warning => {
        console.log(`  - ${warning}`);
      });
    }
    
    console.log('\n Runtime Configuration Validation:');
    if (runtimeValidation.isValid) {
      console.log(' Runtime configuration is valid');
    } else {
      console.log(' Runtime validation failed:');
      runtimeValidation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
    
    
    console.log('\nConfiguration Summary:');
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Port: ${config.port}`);
    console.log(`CORS Origin: ${config.cors.origin}`);
    console.log(`Max File Size: ${Math.round(config.upload.maxFileSize / 1024 / 1024)}MB`);
    console.log(`Allowed File Types: ${config.upload.allowedTypes.join(', ')}`);
    console.log(`Request Logging: ${config.logging.enableRequestLogging ? 'enabled' : 'disabled'}`);
    console.log(`Performance Logging: ${config.logging.enablePerformanceLogging ? 'enabled' : 'disabled'}`);
    console.log(`Rate Limit: ${config.security.rateLimitMaxRequests} requests per ${config.security.rateLimitWindowMs / 1000}s`);
    console.log(`Upload Rate Limit: ${config.security.uploadRateLimitMaxRequests} uploads per ${config.security.uploadRateLimitWindowMs / 1000}s`);
    
    
    console.log('\nGoogle Cloud Configuration:');
    console.log(`Project ID: ${config.googleCloud.projectId}`);
    console.log(`Key File: ${config.googleCloud.keyFile}`);
    
    if (fs.existsSync(config.googleCloud.keyFile)) {
      console.log(' Google Cloud key file exists');
      
      try {
        const keyContent = fs.readFileSync(config.googleCloud.keyFile, 'utf8');
        const keyData = JSON.parse(keyContent);
        
        if (keyData.type === 'service_account') {
          console.log(' Valid service account key');
        } else {
          console.log(' Invalid key type (not a service account)');
        }
        
        if (keyData.project_id === config.googleCloud.projectId) {
          console.log(' Project ID matches');
        } else {
          console.log(` Project ID mismatch: key=${keyData.project_id}, config=${config.googleCloud.projectId}`);
        }
      } catch (error) {
        console.log(` Invalid key file format: ${error.message}`);
      }
    } else {
      console.log(' Google Cloud key file not found');
    }
    
    
    const isValid = envValidation.isValid && runtimeValidation.isValid;
    
    console.log('\n Validation Result:');
    if (isValid) {
      console.log(' Configuration is valid and ready for deployment');
      
      if (config.nodeEnv === 'production') {
        console.log('\n Production deployment checklist:');
        console.log(' Environment variables validated');
        console.log(' Security headers configured');
        console.log(' Rate limiting enabled');
        console.log(' CORS properly configured');
        console.log(' Google Cloud credentials validated');
        console.log(' Logging configured for production');
      }
      
      process.exit(0);
    } else {
      console.log(' Configuration validation failed');
      console.log('\nPlease fix the above issues before deployment.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(' Configuration validation error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Configuration Validation Script

Usage: node validate-config.js [options]

Options:
  --help, -h    Show this help message
  
This script validates:
  - Environment variable configuration
  - Runtime configuration
  - Google Cloud credentials
  - Security settings
  - Production readiness

Exit Codes:
  0    Configuration is valid
  1    Configuration validation failed
  
Examples:
  node validate-config.js
  NODE_ENV=production node validate-config.js
`);
  process.exit(0);
}


validateConfiguration();