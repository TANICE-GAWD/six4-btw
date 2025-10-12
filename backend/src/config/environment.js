require('dotenv').config();
const fs = require('fs');
const path = require('path');


/**
 
 * @param {string} name 
 * @param {string} value 
 * @param {Object} validation 
 * @returns {Object} 
 */
function validateEnvVar(name, value, validation = {}) {
  const errors = [];
  
  
  if (validation.required && !value) {
    errors.push(`${name} is required but not set`);
    return { isValid: false, errors };
  }
  
  
  if (!value && !validation.required) {
    return { isValid: true, errors: [] };
  }
  
  
  if (validation.type === 'number') {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      errors.push(`${name} must be a valid number, got: ${value}`);
    } else if (validation.min && numValue < validation.min) {
      errors.push(`${name} must be at least ${validation.min}, got: ${numValue}`);
    } else if (validation.max && numValue > validation.max) {
      errors.push(`${name} must be at most ${validation.max}, got: ${numValue}`);
    }
  }
  
  
  if (validation.type === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`${name} must be at least ${validation.minLength} characters long`);
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`${name} must be at most ${validation.maxLength} characters long`);
    }
    if (validation.pattern && !validation.pattern.test(value)) {
      errors.push(`${name} does not match required pattern`);
    }
  }
  
  
  if (validation.enum && !validation.enum.includes(value)) {
    errors.push(`${name} must be one of: ${validation.enum.join(', ')}, got: ${value}`);
  }
  
  
  if (validation.fileExists) {
    try {
      const filePath = path.resolve(value);
      if (!fs.existsSync(filePath)) {
        
        const isDevelopment = process.env.NODE_ENV !== 'production';
        if (isDevelopment) {
          
        } else {
          errors.push(`${name} file does not exist: ${filePath}`);
        }
      } else if (!fs.statSync(filePath).isFile()) {
        errors.push(`${name} path is not a file: ${filePath}`);
      }
    } catch (error) {
      errors.push(`${name} file validation failed: ${error.message}`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

const envVarDefinitions = {
  NODE_ENV: {
    required: false,
    type: 'string',
    enum: ['development', 'production', 'test'],
    default: 'development'
  },
  PORT: {
    required: false,
    type: 'number',
    min: 1,
    max: 65535,
    default: 3001
  },
  GOOGLE_CLOUD_PROJECT_ID: {
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 100
  },
  GOOGLE_CLOUD_KEY_FILE: {
    required: false,
    type: 'string',
    fileExists: true
  },
  GOOGLE_APPLICATION_CREDENTIALS_JSON: {
    required: false,
    type: 'string',
    minLength: 10
  },
  CORS_ORIGIN: {
    required: false,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    default: 'http://localhost:3000'
  },
  MAX_FILE_SIZE: {
    required: false,
    type: 'number',
    min: 1024, // 1KB minimum
    max: 100 * 1024 * 1024, // 100MB maximum
    default: 10485760 // 10MB
  },
  ALLOWED_FILE_TYPES: {
    required: false,
    type: 'string',
    default: 'image/jpeg,image/png,image/gif,image/webp'
  },
  
  
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    min: 60000, 
    max: 3600000, 
    default: 900000 
  },
  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    min: 1,
    max: 10000,
    default: 100
  },
  UPLOAD_RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    min: 60000, // 1 minute minimum
    max: 1800000, // 30 minutes maximum
    default: 300000 // 5 minutes
  },
  UPLOAD_RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    min: 1,
    max: 100,
    default: 10
  },
  
  // Logging Configuration
  LOG_LEVEL: {
    required: false,
    type: 'string',
    enum: ['error', 'warn', 'info', 'debug'],
    default: 'info'
  },
  ENABLE_REQUEST_LOGGING: {
    required: false,
    type: 'string',
    enum: ['true', 'false'],
    default: 'true'
  },
  ENABLE_PERFORMANCE_LOGGING: {
    required: false,
    type: 'string',
    enum: ['true', 'false'],
    default: 'true'
  },
  SLOW_REQUEST_THRESHOLD: {
    required: false,
    type: 'number',
    min: 1000, // 1 second minimum
    max: 60000, // 1 minute maximum
    default: 5000 // 5 seconds
  },
  
  // Health Check Configuration
  HEALTH_CHECK_TIMEOUT: {
    required: false,
    type: 'number',
    min: 1000, // 1 second minimum
    max: 30000, // 30 seconds maximum
    default: 10000 // 10 seconds
  },
  
  // Process Configuration
  GRACEFUL_SHUTDOWN_TIMEOUT: {
    required: false,
    type: 'number',
    min: 5000, // 5 seconds minimum
    max: 120000, // 2 minutes maximum
    default: 30000 // 30 seconds
  }
};

/**
 * Validate all environment variables
 * @returns {Object} Validation result with config and errors
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];
  const config = {};
  
  // Validate each environment variable
  Object.entries(envVarDefinitions).forEach(([name, rules]) => {
    const value = process.env[name];
    const validation = validateEnvVar(name, value, rules);
    
    if (!validation.isValid) {
      errors.push(...validation.errors);
    } else {
      // Use provided value or default
      const finalValue = value || rules.default;
      
      // Convert to appropriate type
      if (rules.type === 'number' && finalValue) {
        config[name] = parseInt(finalValue);
      } else {
        config[name] = finalValue;
      }
      
      // Warn about using defaults in production
      if (!value && rules.default && config.NODE_ENV === 'production') {
        warnings.push(`Using default value for ${name} in production environment`);
      }
    }
  });
  
  return { config, errors, warnings };
}

// Validate environment on module load
const validation = validateEnvironment();

if (validation.errors.length > 0) {
  console.error('Environment validation failed:');
  validation.errors.forEach(error => console.error(`  - ${error}`));
  
  if (validation.config.NODE_ENV === 'production') {
    console.error('Exiting due to environment validation errors in production');
    process.exit(1);
  } else {
    console.error('Continuing with errors in development mode');
  }
}

if (validation.warnings.length > 0) {
  console.warn('Environment validation warnings:');
  validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
}

// Build final configuration object
const config = {
  port: validation.config.PORT,
  nodeEnv: validation.config.NODE_ENV,
  
  // Google Cloud Configuration
  googleCloud: {
    projectId: validation.config.GOOGLE_CLOUD_PROJECT_ID,
    keyFile: validation.config.GOOGLE_CLOUD_KEY_FILE,
    credentialsJson: validation.config.GOOGLE_APPLICATION_CREDENTIALS_JSON
  },
  
  // CORS Configuration
  cors: {
    origin: validation.config.CORS_ORIGIN?.split(',').map(origin => origin.trim()) || ['http://localhost:3000']
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: validation.config.MAX_FILE_SIZE,
    allowedTypes: validation.config.ALLOWED_FILE_TYPES?.split(',').map(type => type.trim()) || [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp'
    ]
  },
  
  // Security Configuration
  security: {
    rateLimitWindowMs: validation.config.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: validation.config.RATE_LIMIT_MAX_REQUESTS,
    uploadRateLimitWindowMs: validation.config.UPLOAD_RATE_LIMIT_WINDOW_MS,
    uploadRateLimitMaxRequests: validation.config.UPLOAD_RATE_LIMIT_MAX_REQUESTS
  },
  
  // Logging Configuration
  logging: {
    level: validation.config.LOG_LEVEL,
    enableRequestLogging: validation.config.ENABLE_REQUEST_LOGGING === 'true',
    enablePerformanceLogging: validation.config.ENABLE_PERFORMANCE_LOGGING === 'true',
    slowRequestThreshold: validation.config.SLOW_REQUEST_THRESHOLD
  },
  
  // Health Check Configuration
  healthCheck: {
    timeout: validation.config.HEALTH_CHECK_TIMEOUT
  },
  
  // Process Configuration
  process: {
    gracefulShutdownTimeout: validation.config.GRACEFUL_SHUTDOWN_TIMEOUT
  }
};

/**
 * Get environment validation status
 * @returns {Object} Validation status and details
 */
function getValidationStatus() {
  return {
    isValid: validation.errors.length === 0,
    errors: validation.errors,
    warnings: validation.warnings,
    config: config
  };
}

/**
 * Validate configuration at runtime
 * @returns {Object} Runtime validation result
 */
function validateRuntimeConfig() {
  const errors = [];
  
  // Check Google Cloud credentials (either file or JSON string)
  const hasKeyFile = config.googleCloud.keyFile;
  const hasCredentialsJson = config.googleCloud.credentialsJson;
  
  if (!hasKeyFile && !hasCredentialsJson) {
    errors.push('Either GOOGLE_CLOUD_KEY_FILE or GOOGLE_APPLICATION_CREDENTIALS_JSON must be provided');
    return { isValid: false, errors };
  }
  
  try {
    let keyData;
    
    if (hasCredentialsJson) {
      // Use JSON credentials (preferred for Vercel/serverless)
      try {
        keyData = JSON.parse(config.googleCloud.credentialsJson);
      } catch (parseError) {
        errors.push('GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON');
        return { isValid: false, errors };
      }
    } else if (hasKeyFile) {
      // Use file-based credentials
      if (!fs.existsSync(config.googleCloud.keyFile)) {
        if (config.nodeEnv === 'production') {
          errors.push(`Google Cloud key file does not exist: ${config.googleCloud.keyFile}`);
        }
        // In development, this will be handled by service initialization
        return { isValid: config.nodeEnv !== 'production', errors };
      } else {
        const keyFileContent = fs.readFileSync(config.googleCloud.keyFile, 'utf8');
        keyData = JSON.parse(keyFileContent);
      }
    }
    
    // Validate key data structure
    if (keyData) {
      if (!keyData.type || keyData.type !== 'service_account') {
        errors.push('Google Cloud credentials are not a valid service account key');
      }
      
      if (!keyData.project_id) {
        errors.push('Google Cloud credentials missing project_id');
      }
      
      if (keyData.project_id !== config.googleCloud.projectId) {
        errors.push('Google Cloud credentials project_id does not match GOOGLE_CLOUD_PROJECT_ID');
      }
    }
    
  } catch (error) {
    if (config.nodeEnv === 'production') {
      errors.push(`Failed to validate Google Cloud credentials: ${error.message}`);
    }
    // In development, log as warning but don't fail
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

console.log(`Environment configuration loaded successfully (${config.nodeEnv} mode)`);

module.exports = {
  ...config,
  getValidationStatus,
  validateRuntimeConfig
};