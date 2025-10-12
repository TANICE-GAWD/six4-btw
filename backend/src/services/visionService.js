const { ImageAnnotatorClient } = require('@google-cloud/vision');

class VisionService {
  constructor() {
    this.client = null;
    this.maxRetries = 3;
    this.retryDelay = 1000; 
    this.timeout = 30000; 
    
    
    this.circuitBreaker = {
      state: 'CLOSED', 
      failureCount: 0,
      failureThreshold: 5,
      resetTimeout: 60000, 
      lastFailureTime: null,
      successCount: 0,
      halfOpenSuccessThreshold: 2
    };
    
    this.initializeClient();
  }

  /**
   * Initialize Google Cloud Vision client with service account authentication
   */
  initializeClient() {
    try {
      const config = {};
      
      // Priority: JSON credentials (for Vercel) > Key file (for local dev)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
          const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          config.credentials = credentials;
          config.projectId = credentials.project_id;
          console.log('Using JSON credentials for Google Cloud Vision');
        } catch (parseError) {
          console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', parseError.message);
          throw new Error('Invalid Google Cloud credentials JSON');
        }
      } else if (process.env.GOOGLE_CLOUD_KEY_FILE) {
        config.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
        console.log('Using key file for Google Cloud Vision');
      }
      
      // Override project ID if explicitly set
      if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
        config.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      }
      
      if (!config.credentials && !config.keyFilename) {
        throw new Error('No Google Cloud credentials provided (GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_CLOUD_KEY_FILE required)');
      }
      
      this.client = new ImageAnnotatorClient(config);
      console.log('Google Cloud Vision client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Cloud Vision client:', error.message);
      throw new Error('Vision service initialization failed');
    }
  }

  /**
   * Analyze image using Google Cloud Vision API with labelDetection
   * Implements circuit breaker pattern for graceful error recovery
   * 
   * @param {Buffer} imageBuffer - Image data as Buffer
   * @returns {Promise<Array>} Array of label annotations
   */
  async analyzeImage(imageBuffer) {
    
    const circuitState = this.checkCircuitBreaker();
    if (circuitState === 'OPEN') {
      const error = new Error('Vision service circuit breaker is OPEN - service temporarily unavailable');
      error.code = 'VISION_CIRCUIT_OPEN';
      throw error;
    }

    if (!this.client) {
      throw new Error('Vision client not initialized');
    }

    if (!Buffer.isBuffer(imageBuffer)) {
      throw new Error('Invalid image buffer provided');
    }

    const request = {
      image: {
        content: imageBuffer.toString('base64')
      },
      features: [
        {
          type: 'LABEL_DETECTION',
          maxResults: 20
        },
        {
          type: 'TEXT_DETECTION',
          maxResults: 10
        }
      ]
    };

    try {
      const result = await this.executeWithRetry(async () => {
        const startTime = Date.now();
        
        try {
          const [result] = await Promise.race([
            this.client.annotateImage(request),
            this.createTimeoutPromise()
          ]);
          
          const processingTime = Date.now() - startTime;
          console.log(`Vision API call completed in ${processingTime}ms`);
          
          
          return {
            labels: result.labelAnnotations || [],
            textAnnotations: result.textAnnotations || []
          };
        } catch (error) {
          console.error('Vision API call failed:', error.message);
          throw this.transformError(error);
        }
      });

      
      this.recordSuccess();
      return result;

    } catch (error) {
      
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Execute function with retry logic for transient failures
   * Implements graceful error recovery for AI service failures
   * 
   * Requirements fulfilled:
   * - 13.2: Graceful error recovery for AI service failures
   * 
   * @param {Function} fn - Function to execute
   * @returns {Promise} Result of function execution
   */
  async executeWithRetry(fn) {
    let lastError;
    const retryLog = {
      attempts: [],
      totalAttempts: 0,
      startTime: Date.now()
    };
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      const attemptStartTime = Date.now();
      retryLog.totalAttempts = attempt;
      
      try {
        const result = await fn();
        
        
        if (attempt > 1) {
          retryLog.attempts.push({
            attempt,
            success: true,
            duration: Date.now() - attemptStartTime
          });
          
          console.log(`Vision API succeeded on attempt ${attempt}:`, {
            ...retryLog,
            totalDuration: Date.now() - retryLog.startTime
          });
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        retryLog.attempts.push({
          attempt,
          success: false,
          error: error.message,
          errorCode: error.code,
          duration: Date.now() - attemptStartTime,
          retryable: !this.isNonRetryableError(error)
        });
        
        
        if (this.isNonRetryableError(error)) {
          console.error(`Vision API non-retryable error on attempt ${attempt}:`, {
            error: error.message,
            code: error.code,
            retryLog
          });
          throw error;
        }
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); 
          
          console.warn(`Vision API attempt ${attempt} failed, retrying in ${delay}ms:`, {
            error: error.message,
            code: error.code,
            nextAttempt: attempt + 1,
            maxRetries: this.maxRetries
          });
          
          await this.sleep(delay);
        } else {
          
          console.error(`Vision API failed after ${attempt} attempts:`, {
            ...retryLog,
            totalDuration: Date.now() - retryLog.startTime,
            finalError: error.message
          });
        }
      }
    }
    
    
    const enhancedError = this.transformError(lastError);
    enhancedError.retryInfo = {
      attempts: retryLog.totalAttempts,
      totalDuration: Date.now() - retryLog.startTime,
      retryable: !this.isNonRetryableError(lastError)
    };
    
    throw enhancedError;
  }

  /**
   * Create a timeout promise that rejects after the specified timeout
   * @returns {Promise} Promise that rejects on timeout
   */
  createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Vision API request timeout'));
      }, this.timeout);
    });
  }

  /**
   * Check if error should not be retried
   * @param {Error} error - Error to check
   * @returns {boolean} True if error should not be retried
   */
  isNonRetryableError(error) {
    const nonRetryableCodes = [
      'UNAUTHENTICATED',
      'PERMISSION_DENIED',
      'INVALID_ARGUMENT',
      'QUOTA_EXCEEDED'
    ];
    
    return nonRetryableCodes.some(code => 
      error.message.includes(code) || 
      error.code === code
    );
  }

  /**
   * Transform Google Cloud Vision errors into application-specific errors
   * @param {Error} error - Original error
   * @returns {Error} Transformed error
   */
  transformError(error) {
    if (error.message.includes('timeout')) {
      const timeoutError = new Error('Vision API request timed out');
      timeoutError.code = 'VISION_TIMEOUT';
      return timeoutError;
    }
    
    if (error.message.includes('UNAUTHENTICATED')) {
      const authError = new Error('Vision API authentication failed');
      authError.code = 'VISION_AUTH_ERROR';
      return authError;
    }
    
    if (error.message.includes('QUOTA_EXCEEDED')) {
      const quotaError = new Error('Vision API quota exceeded');
      quotaError.code = 'VISION_QUOTA_ERROR';
      return quotaError;
    }
    
    if (error.message.includes('PERMISSION_DENIED')) {
      const permError = new Error('Vision API permission denied');
      permError.code = 'VISION_PERMISSION_ERROR';
      return permError;
    }
    
    
    const genericError = new Error('Vision API service error');
    genericError.code = 'VISION_SERVICE_ERROR';
    genericError.originalError = error;
    return genericError;
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate that the service is properly configured
   * @returns {boolean} True if service is ready
   */
  isReady() {
    return this.client !== null;
  }

  /**
   * Check circuit breaker state and update if necessary
   * @returns {string} Current circuit breaker state
   */
  checkCircuitBreaker() {
    const now = Date.now();
    
    switch (this.circuitBreaker.state) {
      case 'OPEN':
        
        if (now - this.circuitBreaker.lastFailureTime >= this.circuitBreaker.resetTimeout) {
          console.log('Circuit breaker transitioning from OPEN to HALF_OPEN');
          this.circuitBreaker.state = 'HALF_OPEN';
          this.circuitBreaker.successCount = 0;
        }
        break;
        
      case 'HALF_OPEN':
        
        break;
        
      case 'CLOSED':
      default:
        
        break;
    }
    
    return this.circuitBreaker.state;
  }

  /**
   * Record successful API call for circuit breaker
   */
  recordSuccess() {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.successCount++;
      
      if (this.circuitBreaker.successCount >= this.circuitBreaker.halfOpenSuccessThreshold) {
        console.log('Circuit breaker transitioning from HALF_OPEN to CLOSED');
        this.circuitBreaker.state = 'CLOSED';
        this.circuitBreaker.failureCount = 0;
        this.circuitBreaker.successCount = 0;
      }
    } else if (this.circuitBreaker.state === 'CLOSED') {
      
      this.circuitBreaker.failureCount = 0;
    }
  }

  /**
   * Record failed API call for circuit breaker
   */
  recordFailure() {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      console.log('Circuit breaker transitioning from HALF_OPEN to OPEN due to failure');
      this.circuitBreaker.state = 'OPEN';
      this.circuitBreaker.successCount = 0;
    } else if (this.circuitBreaker.state === 'CLOSED' && 
               this.circuitBreaker.failureCount >= this.circuitBreaker.failureThreshold) {
      console.log(`Circuit breaker transitioning from CLOSED to OPEN after ${this.circuitBreaker.failureCount} failures`);
      this.circuitBreaker.state = 'OPEN';
    }
  }

  /**
   * Get service health status
   * @returns {Object} Health status information
   */
  getHealthStatus() {
    return {
      isReady: this.isReady(),
      hasCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_KEY_FILE),
      hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentialsType: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 'JSON' : 'FILE',
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      circuitBreaker: {
        state: this.circuitBreaker.state,
        failureCount: this.circuitBreaker.failureCount,
        failureThreshold: this.circuitBreaker.failureThreshold,
        lastFailureTime: this.circuitBreaker.lastFailureTime,
        resetTimeout: this.circuitBreaker.resetTimeout
      }
    };
  }
}

module.exports = VisionService;