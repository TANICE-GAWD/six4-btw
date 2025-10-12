/**
 * Centralized Error Handling Utilities
 * Provides comprehensive error management, logging, and recovery mechanisms
 */

import { formatErrorMessage, isRetryableError, createError } from './errorMessages.js';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Error categories for different handling strategies
 */
export const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  API: 'api',
  RUNTIME: 'runtime',
  PERMISSION: 'permission',
  RESOURCE: 'resource',
};

/**
 * Global error handler class for centralized error management
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.errorListeners = [];
    this.maxLogSize = 100;
    this.enableLogging = true;
  }

  /**
   * Handle an error with appropriate logging and recovery
   * @param {Error|string} error - The error to handle
   * @param {Object} context - Additional context about the error
   * @param {string} context.component - Component where error occurred
   * @param {string} context.action - Action that caused the error
   * @param {string} context.severity - Error severity level
   * @param {string} context.category - Error category
   * @returns {Object} Processed error information
   */
  handleError(error, context = {}) {
    const processedError = this.processError(error, context);
    
    // Log the error
    if (this.enableLogging) {
      this.logError(processedError);
    }
    
    // Notify listeners
    this.notifyListeners(processedError);
    
    // Determine recovery strategy
    const recoveryStrategy = this.getRecoveryStrategy(processedError);
    
    return {
      ...processedError,
      recoveryStrategy,
    };
  }

  /**
   * Process raw error into standardized format
   * @param {Error|string} error - Raw error
   * @param {Object} context - Error context
   * @returns {Object} Processed error
   */
  processError(error, context) {
    const timestamp = new Date().toISOString();
    const id = this.generateErrorId();
    
    // Extract error information
    let message, code, stack, originalError;
    
    if (typeof error === 'string') {
      message = error;
      code = 'GENERIC_ERROR';
    } else if (error instanceof Error) {
      message = error.message;
      code = error.code || error.name || 'UNKNOWN_ERROR';
      stack = error.stack;
      originalError = error;
    } else if (error && typeof error === 'object') {
      message = error.message || 'Unknown error';
      code = error.code || 'OBJECT_ERROR';
      originalError = error;
    } else {
      message = 'An unknown error occurred';
      code = 'UNKNOWN_ERROR';
    }

    return {
      id,
      timestamp,
      message: formatErrorMessage(error),
      code,
      stack,
      originalError,
      context: {
        component: 'unknown',
        action: 'unknown',
        severity: ERROR_SEVERITY.MEDIUM,
        category: ERROR_CATEGORIES.RUNTIME,
        ...context,
      },
      retryable: isRetryableError(error),
      userFriendlyMessage: formatErrorMessage(error),
    };
  }

  /**
   * Log error to internal log and external services
   * @param {Object} processedError - Processed error object
   */
  logError(processedError) {
    // Add to internal log
    this.errorLog.unshift(processedError);
    
    // Maintain log size limit
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
    
    // Console logging based on severity
    const { severity } = processedError.context;
    const logMessage = `[${severity.toUpperCase()}] ${processedError.message}`;
    
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        console.error(logMessage, processedError);
        break;
      case ERROR_SEVERITY.HIGH:
        console.error(logMessage, processedError);
        break;
      case ERROR_SEVERITY.MEDIUM:
        console.warn(logMessage, processedError);
        break;
      case ERROR_SEVERITY.LOW:
        console.info(logMessage, processedError);
        break;
      default:
        console.log(logMessage, processedError);
    }
    
    // Send to external monitoring service in production
    if (import.meta.env.PROD && severity !== ERROR_SEVERITY.LOW) {
      this.reportToMonitoring(processedError);
    }
  }

  /**
   * Report error to external monitoring service
   * @param {Object} processedError - Processed error object
   */
  reportToMonitoring(processedError) {
    // In a real application, this would send to services like:
    // - Sentry
    // - LogRocket
    // - Bugsnag
    // - Custom logging endpoint
    
    try {
      // Example implementation
      if (window.Sentry) {
        window.Sentry.captureException(processedError.originalError || new Error(processedError.message), {
          tags: {
            component: processedError.context.component,
            action: processedError.context.action,
            category: processedError.context.category,
          },
          level: this.mapSeverityToSentryLevel(processedError.context.severity),
          extra: {
            errorId: processedError.id,
            context: processedError.context,
          },
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error to monitoring service:', reportingError);
    }
  }

  /**
   * Map internal severity to Sentry levels
   * @param {string} severity - Internal severity level
   * @returns {string} Sentry level
   */
  mapSeverityToSentryLevel(severity) {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return 'fatal';
      case ERROR_SEVERITY.HIGH:
        return 'error';
      case ERROR_SEVERITY.MEDIUM:
        return 'warning';
      case ERROR_SEVERITY.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Determine recovery strategy based on error characteristics
   * @param {Object} processedError - Processed error object
   * @returns {Object} Recovery strategy
   */
  getRecoveryStrategy(processedError) {
    const { category, severity } = processedError.context;
    const { retryable } = processedError;

    // Base strategy
    const strategy = {
      canRetry: retryable,
      maxRetries: 3,
      retryDelay: 1000,
      gracefulDegradation: false,
      fallbackAction: null,
      userAction: 'none', // 'none', 'retry', 'refresh', 'contact_support'
    };

    // Customize based on category
    switch (category) {
      case ERROR_CATEGORIES.NETWORK:
        strategy.canRetry = true;
        strategy.maxRetries = 5;
        strategy.retryDelay = 2000;
        strategy.userAction = 'retry';
        strategy.fallbackAction = 'show_offline_message';
        break;

      case ERROR_CATEGORIES.API:
        strategy.canRetry = retryable;
        strategy.maxRetries = 3;
        strategy.retryDelay = 1500;
        strategy.userAction = retryable ? 'retry' : 'contact_support';
        break;

      case ERROR_CATEGORIES.VALIDATION:
        strategy.canRetry = false;
        strategy.userAction = 'none';
        strategy.gracefulDegradation = true;
        break;

      case ERROR_CATEGORIES.PERMISSION:
        strategy.canRetry = false;
        strategy.userAction = 'contact_support';
        break;

      case ERROR_CATEGORIES.RESOURCE:
        strategy.canRetry = true;
        strategy.maxRetries = 2;
        strategy.retryDelay = 3000;
        strategy.userAction = 'retry';
        break;

      case ERROR_CATEGORIES.RUNTIME:
        strategy.canRetry = severity !== ERROR_SEVERITY.CRITICAL;
        strategy.maxRetries = 1;
        strategy.userAction = severity === ERROR_SEVERITY.CRITICAL ? 'refresh' : 'retry';
        break;
    }

    // Adjust based on severity
    if (severity === ERROR_SEVERITY.CRITICAL) {
      strategy.canRetry = false;
      strategy.userAction = 'refresh';
      strategy.gracefulDegradation = false;
    } else if (severity === ERROR_SEVERITY.LOW) {
      strategy.gracefulDegradation = true;
    }

    return strategy;
  }

  /**
   * Add error listener for custom error handling
   * @param {Function} listener - Error listener function
   */
  addErrorListener(listener) {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   * @param {Function} listener - Error listener to remove
   */
  removeErrorListener(listener) {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Notify all error listeners
   * @param {Object} processedError - Processed error object
   */
  notifyListeners(processedError) {
    this.errorListeners.forEach(listener => {
      try {
        listener(processedError);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Generate unique error ID
   * @returns {string} Unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error log
   * @param {number} limit - Maximum number of errors to return
   * @returns {Array} Error log entries
   */
  getErrorLog(limit = 50) {
    return this.errorLog.slice(0, limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const total = this.errorLog.length;
    const byCategory = {};
    const bySeverity = {};
    const byComponent = {};

    this.errorLog.forEach(error => {
      const { category, severity, component } = error.context;
      
      byCategory[category] = (byCategory[category] || 0) + 1;
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      byComponent[component] = (byComponent[component] || 0) + 1;
    });

    return {
      total,
      byCategory,
      bySeverity,
      byComponent,
    };
  }
}

// Create global error handler instance
export const globalErrorHandler = new ErrorHandler();

/**
 * Convenience function for handling errors
 * @param {Error|string} error - Error to handle
 * @param {Object} context - Error context
 * @returns {Object} Processed error with recovery strategy
 */
export const handleError = (error, context = {}) => {
  return globalErrorHandler.handleError(error, context);
};

/**
 * Create error with context helper
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} context - Error context
 * @returns {Object} Processed error
 */
export const createErrorWithContext = (message, code, context = {}) => {
  const error = createError(code, message);
  return handleError(error, context);
};

// Set up global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, {
      component: 'global',
      action: 'unhandled_promise_rejection',
      severity: ERROR_SEVERITY.HIGH,
      category: ERROR_CATEGORIES.RUNTIME,
    });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    handleError(event.error || event.message, {
      component: 'global',
      action: 'uncaught_error',
      severity: ERROR_SEVERITY.HIGH,
      category: ERROR_CATEGORIES.RUNTIME,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

export default globalErrorHandler;