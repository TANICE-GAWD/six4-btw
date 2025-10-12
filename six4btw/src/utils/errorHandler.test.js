/**
 * Error Handler Tests
 * Basic tests to verify error handling functionality
 */

import { 
  globalErrorHandler, 
  handleError, 
  createErrorWithContext,
  ERROR_SEVERITY,
  ERROR_CATEGORIES 
} from './errorHandler.js';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
  globalErrorHandler.clearErrorLog();
});

describe('Error Handler', () => {
  test('should handle string errors', () => {
    const result = handleError('Test error message');
    
    expect(result.message).toBe('Test error message');
    expect(result.code).toBe('GENERIC_ERROR');
    expect(result.id).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });

  test('should handle Error objects', () => {
    const error = new Error('Test error');
    error.code = 'TEST_ERROR';
    
    const result = handleError(error);
    
    expect(result.message).toBe('Test error');
    expect(result.code).toBe('TEST_ERROR');
    expect(result.originalError).toBe(error);
  });

  test('should apply context correctly', () => {
    const context = {
      component: 'TestComponent',
      action: 'test_action',
      severity: ERROR_SEVERITY.HIGH,
      category: ERROR_CATEGORIES.VALIDATION,
    };
    
    const result = handleError('Test error', context);
    
    expect(result.context.component).toBe('TestComponent');
    expect(result.context.action).toBe('test_action');
    expect(result.context.severity).toBe(ERROR_SEVERITY.HIGH);
    expect(result.context.category).toBe(ERROR_CATEGORIES.VALIDATION);
  });

  test('should determine recovery strategy based on category', () => {
    const networkError = handleError('Network error', {
      category: ERROR_CATEGORIES.NETWORK,
    });
    
    expect(networkError.recoveryStrategy.canRetry).toBe(true);
    expect(networkError.recoveryStrategy.maxRetries).toBe(5);
    expect(networkError.recoveryStrategy.userAction).toBe('retry');
    
    const validationError = handleError('Validation error', {
      category: ERROR_CATEGORIES.VALIDATION,
    });
    
    expect(validationError.recoveryStrategy.canRetry).toBe(false);
    expect(validationError.recoveryStrategy.gracefulDegradation).toBe(true);
  });

  test('should maintain error log', () => {
    handleError('Error 1');
    handleError('Error 2');
    handleError('Error 3');
    
    const log = globalErrorHandler.getErrorLog();
    expect(log).toHaveLength(3);
    expect(log[0].message).toBe('Error 3'); // Most recent first
    expect(log[2].message).toBe('Error 1');
  });

  test('should generate error statistics', () => {
    handleError('Network error', { category: ERROR_CATEGORIES.NETWORK });
    handleError('API error', { category: ERROR_CATEGORIES.API });
    handleError('Another network error', { category: ERROR_CATEGORIES.NETWORK });
    
    const stats = globalErrorHandler.getErrorStats();
    expect(stats.total).toBe(3);
    expect(stats.byCategory[ERROR_CATEGORIES.NETWORK]).toBe(2);
    expect(stats.byCategory[ERROR_CATEGORIES.API]).toBe(1);
  });

  test('should create error with context helper', () => {
    const result = createErrorWithContext('Test message', 'TEST_CODE', {
      component: 'TestComponent',
    });
    
    expect(result.message).toBe('Test message');
    expect(result.code).toBe('TEST_CODE');
    expect(result.context.component).toBe('TestComponent');
  });

  test('should handle error listeners', () => {
    const listener = jest.fn();
    globalErrorHandler.addErrorListener(listener);
    
    handleError('Test error');
    
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      })
    );
    
    globalErrorHandler.removeErrorListener(listener);
  });
});