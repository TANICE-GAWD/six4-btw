/**
 * Higher-Order Component for Error Boundary
 * Provides a convenient way to wrap components with error boundaries
 */

import React from 'react';
import ErrorBoundary from './ErrorBoundary.jsx';

/**
 
 * @param {React.Component} WrappedComponent
 * @param {Object} errorBoundaryProps 
 * @returns {React.Component} 
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  const WithErrorBoundaryComponent = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  
  WithErrorBoundaryComponent.displayName = 
    `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
};

/**
 * Hook for error boundary functionality in functional components
 * @param {Function} onError 
 * @returns {Object} 
 */
export const useErrorHandler = (onError) => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    setError(error);
    if (onError) {
      onError(error);
    }
  }, [onError]);

  
  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError,
    hasError: !!error,
  };
};

export default withErrorBoundary;