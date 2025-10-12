// Serverless-friendly environment configuration
// Avoids file system operations that might fail in serverless environments

/**
 * Validate environment variable
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
  
  return { isValid: errors.length === 0, errors };
}

const envVarDefinitions = {
  NODE_ENV: {
    required: false,
    type: 'string',
    enum: ['development', 'production', 'test'],
    default: 'production'
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
    type: 'string'
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
    min: 1024,
    max: 100 * 1024 * 1024,
    default: 10485760
  },
  ALLOWED_FILE_TYPES: {
    required: false,
    type: 'string',
    default: 'image/jpeg,image/png,image/gif,image/webp'
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
  
  // Security Configuration (simplified for serverless)
  security: {
    rateLimitWindowMs: 900000,
    rateLimitMaxRequests: 100,
    uploadRateLimitWindowMs: 300000,
    uploadRateLimitMaxRequests: 10
  },
  
  // Logging Configuration
  logging: {
    level: 'info',
    enableRequestLogging: true,
    enablePerformanceLogging: true,
    slowRequestThreshold: 5000
  },
  
  // Health Check Configuration
  healthCheck: {
    timeout: 10000
  },
  
  // Process Configuration
  process: {
    gracefulShutdownTimeout: 30000
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
 * Validate configuration at runtime (serverless-friendly)
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
  
  // Validate JSON credentials if provided
  if (hasCredentialsJson) {
    try {
      const keyData = JSON.parse(config.googleCloud.credentialsJson);
      
      if (!keyData.type || keyData.type !== 'service_account') {
        errors.push('Google Cloud credentials are not a valid service account key');
      }
      
      if (!keyData.project_id) {
        errors.push('Google Cloud credentials missing project_id');
      }
      
      if (keyData.project_id !== config.googleCloud.projectId) {
        errors.push('Google Cloud credentials project_id does not match GOOGLE_CLOUD_PROJECT_ID');
      }
    } catch (parseError) {
      errors.push('GOOGLE_APPLICATION_CREDENTIALS_JSON is not valid JSON');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

console.log(`Serverless environment configuration loaded (${config.nodeEnv} mode)`);

module.exports = {
  ...config,
  getValidationStatus,
  validateRuntimeConfig
};