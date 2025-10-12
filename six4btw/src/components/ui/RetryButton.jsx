/**
 * Retry Button Component
 * Provides retry functionality for recoverable errors with exponential backoff
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isRetryableError } from '../../utils/errorMessages.js';

/**
 * RetryButton component with intelligent retry logic
 * @param {Object} props 
 * @param {Function} props.onRetry 
 * @param {string|Error} props.error 
 * @param {number} props.maxRetries 
 * @param {number} props.baseDelay 
 * @param {boolean} props.disabled 
 * @param {string} props.className 
 * @param {React.ReactNode} props.children 
 */
const RetryButton = ({
  onRetry,
  error,
  maxRetries = 3,
  baseDelay = 1000,
  disabled = false,
  className = '',
  children = 'Try Again',
  ...props
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [nextRetryTime, setNextRetryTime] = useState(null);

  
  const canRetry = isRetryableError(error) && retryCount < maxRetries && !disabled;

  /**
   * Calculate delay with exponential backoff
   * @param {number} attempt - Current attempt number
   * @returns {number} - Delay in milliseconds
   */
  const calculateDelay = useCallback((attempt) => {
    return baseDelay * Math.pow(2, attempt);
  }, [baseDelay]);

  /**
   * Handle retry with exponential backoff
   */
  const handleRetry = useCallback(async () => {
    if (!canRetry || isRetrying) {
      return;
    }

    setIsRetrying(true);
    
    try {
      
      const delay = calculateDelay(retryCount);
      
      
      if (delay > 1000) {
        const endTime = Date.now() + delay;
        setNextRetryTime(endTime);
        
        
        const countdownInterval = setInterval(() => {
          const remaining = endTime - Date.now();
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            setNextRetryTime(null);
          }
        }, 1000);
        
        
        await new Promise(resolve => setTimeout(resolve, delay));
        clearInterval(countdownInterval);
        setNextRetryTime(null);
      }

      
      setRetryCount(prev => prev + 1);
      
      
      await onRetry();
      
      
      setRetryCount(0);
      
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry, isRetrying, retryCount, onRetry, calculateDelay]);

  /**
   * Reset retry state
   */
  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setNextRetryTime(null);
  }, []);

  
  if (!isRetryableError(error)) {
    return null;
  }

  
  const remainingTime = nextRetryTime ? Math.max(0, Math.ceil((nextRetryTime - Date.now()) / 1000)) : 0;

  
  const isDisabled = disabled || !canRetry || isRetrying;
  const buttonContent = (() => {
    if (remainingTime > 0) {
      return `Retrying in ${remainingTime}s...`;
    }
    if (isRetrying) {
      return (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Retrying...
        </span>
      );
    }
    if (retryCount >= maxRetries) {
      return 'Max retries reached';
    }
    return retryCount > 0 ? `Try Again (${retryCount}/${maxRetries})` : children;
  })();

  const baseClasses = `
    inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    transition-colors duration-200
  `;

  const stateClasses = isDisabled
    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800';

  
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    disabled: { 
      scale: 1,
      opacity: 0.6,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.button
        onClick={handleRetry}
        disabled={isDisabled}
        className={`${baseClasses} ${stateClasses} ${className}`}
        variants={buttonVariants}
        initial="initial"
        whileHover={!isDisabled ? "hover" : "disabled"}
        whileTap={!isDisabled ? "tap" : "disabled"}
        animate={isRetrying ? pulseVariants.pulse : "initial"}
        {...props}
      >
        <motion.span
          key={buttonContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {buttonContent}
        </motion.span>
      </motion.button>
      
      <AnimatePresence>
        {retryCount > 0 && (
          <motion.div 
            className="text-xs text-gray-500 text-center"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {retryCount >= maxRetries ? (
              <motion.span 
                className="text-red-600"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                Maximum retry attempts reached. Please refresh the page or contact support.
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                Attempt {retryCount} of {maxRetries}
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {retryCount > 0 && retryCount < maxRetries && (
          <motion.button
            onClick={resetRetry}
            className="text-xs text-blue-600 hover:text-blue-800 underline block mx-auto"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset retry count
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RetryButton;