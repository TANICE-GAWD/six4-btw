/**
 * Lazy loading utilities for performance optimization
 * Implements code splitting and dynamic imports for non-critical components
 */

import { lazy, Suspense, useState, useEffect, useRef } from 'react';

/**
 * Creates a lazy-loaded component with error boundary and loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Lazy-loaded component with Suspense wrapper
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback = null, // Will be handled by Suspense boundary
    errorFallback = null, // Will be handled by Error boundary
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const LazyComponent = lazy(() => 
    retryImport(importFunc, retryCount, retryDelay)
  );

  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};

/**
 * Retry mechanism for failed dynamic imports
 * @param {Function} importFunc - Dynamic import function
 * @param {number} retryCount - Number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise} - Promise that resolves to the imported module
 */
const retryImport = async (importFunc, retryCount, retryDelay) => {
  let lastError;
  
  for (let i = 0; i <= retryCount; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error;
      
      if (i < retryCount) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Preloads a component for better perceived performance
 * @param {Function} importFunc - Dynamic import function
 * @returns {Promise} - Promise that resolves when component is preloaded
 */
export const preloadComponent = (importFunc) => {
  return importFunc();
};

/**
 * Creates a lazy component with intersection observer for viewport-based loading
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Component that loads when entering viewport
 */
export const createViewportLazyComponent = (importFunc, options = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    fallback = null
  } = options;

  return function ViewportLazyWrapper(props) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin, threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    if (!isVisible) {
      return <div ref={ref} className="h-32 bg-gray-100 animate-pulse rounded">{fallback}</div>;
    }

    const LazyComponent = createLazyComponent(importFunc, options);
    return <LazyComponent {...props} />;
  };
};

/**
 * Bundle splitting configuration for different component types
 */
export const LAZY_LOAD_CONFIG = {
  // Non-critical UI components
  ui: {
    fallback: null,
    retryCount: 2,
    retryDelay: 500
  },
  
  // Feature components that might be heavy
  features: {
    fallback: null,
    retryCount: 3,
    retryDelay: 1000
  },
  
  // Utility components
  utils: {
    fallback: null,
    retryCount: 1,
    retryDelay: 300
  }
};