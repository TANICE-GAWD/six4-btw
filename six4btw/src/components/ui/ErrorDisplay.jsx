/**
 * Error Display Component
 * Provides consistent error messaging with graceful degradation options
 */

import React from 'react';
import { motion } from 'framer-motion';
import RetryButton from './RetryButton.jsx';
import { formatErrorMessage, isRetryableError } from '../../utils/errorMessages.js';

/**
 
 * @param {Object} props 
 * @param {string|Error} props.error 
 * @param {Function} props.onRetry 
 * @param {Function} props.onDismiss 
 * @param {boolean} props.showRetry 
 * @param {boolean} props.showDismiss 
 * @param {string} props.variant 
 * @param {string} props.severity 
 * @param {React.ReactNode} props.fallbackContent 
 * @param {boolean} props.enableGracefulDegradation 
 */
const ErrorDisplay = ({
  error,
  onRetry,
  onDismiss,
  showRetry = true,
  showDismiss = false,
  variant = 'card',
  severity = 'error',
  fallbackContent = null,
  enableGracefulDegradation = false,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  const errorMessage = formatErrorMessage(error);
  const canRetry = isRetryableError(error);

  
  if (enableGracefulDegradation && fallbackContent && severity !== 'error') {
    return (
      <div className={`relative ${className}`}>
        {fallbackContent}
        <div className="absolute top-0 right-0 p-2">
          <div className="bg-yellow-100 border border-yellow-300 rounded-md p-2 text-xs text-yellow-800">
            Feature temporarily unavailable
          </div>
        </div>
      </div>
    );
  }

  
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  
  const getColorClasses = () => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          button: 'text-red-600 hover:text-red-800',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          button: 'text-yellow-600 hover:text-yellow-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          button: 'text-blue-600 hover:text-blue-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          button: 'text-gray-600 hover:text-gray-800',
        };
    }
  };

  const colors = getColorClasses();

  
  const renderContent = () => {
    const icon = getIcon();
    
    return (
      <div className="flex">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className={`${icon ? 'ml-3' : ''} flex-1`}>
          <p className={`text-sm font-medium ${colors.text}`}>
            {errorMessage}
          </p>
          
          {(showRetry || showDismiss) && (
            <div className="mt-3 flex space-x-3">
              {showRetry && canRetry && onRetry && (
                <RetryButton
                  onRetry={onRetry}
                  error={error}
                  className="text-sm"
                >
                  Try Again
                </RetryButton>
              )}
              
              {showDismiss && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`text-sm underline ${colors.button}`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {showDismiss && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex ${colors.button}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  
  const errorVariants = {
    initial: { 
      opacity: 0, 
      y: 10, 
      scale: 0.95 
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  const shakeVariants = {
    shake: {
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.4,
        ease: 'easeInOut'
      }
    }
  };

  
  switch (variant) {
    case 'banner':
      return (
        <motion.div 
          className={`${colors.bg} ${colors.border} border-l-4 p-4 ${className}`}
          variants={errorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            variants={severity === 'error' ? shakeVariants : {}}
            animate={severity === 'error' ? 'shake' : ''}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      );
      
    case 'inline':
      return (
        <motion.div 
          className={`flex items-center space-x-2 ${colors.text} ${className}`}
          variants={errorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {getIcon()}
          </motion.div>
          <motion.span 
            className="text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {errorMessage}
          </motion.span>
          {showRetry && canRetry && onRetry && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <RetryButton
                onRetry={onRetry}
                error={error}
                className="text-xs ml-2"
              >
                Retry
              </RetryButton>
            </motion.div>
          )}
        </motion.div>
      );
      
    case 'card':
    default:
      return (
        <motion.div 
          className={`rounded-md ${colors.bg} ${colors.border} border p-4 ${className}`}
          variants={errorVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            variants={severity === 'error' ? shakeVariants : {}}
            animate={severity === 'error' ? 'shake' : ''}
          >
            {renderContent()}
          </motion.div>
        </motion.div>
      );
  }
};

export default ErrorDisplay;