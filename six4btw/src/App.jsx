

import React, { Suspense, useEffect } from 'react';
import { HomePage } from './pages/HomePage.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary.jsx';
import { LazyNetworkStatus } from './components/lazy/index.js';
import Spinner from './components/ui/Spinner.jsx';
import { performanceMonitor } from './utils/performanceMonitor.js';
import './App.css';


if (process.env.NODE_ENV === 'development') {
  import('./utils/integrationTest.js');
}

const AppLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <Spinner size="large" />
      <p className="mt-4 text-gray-600 text-lg">Loading Image Performance Rater...</p>
    </div>
  </div>
);


function App() {
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      
      const checkInitialPerformance = () => {
        performanceMonitor.checkPerformance();
        
        
        const criticalComponents = [
          'HomePage',
          'ImageUploader', 
          'ResultsDisplay',
          'RatingMeter'
        ];

      };
      
      
      const timeoutId = setTimeout(checkInitialPerformance, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <ErrorBoundary 
      isCritical={true} 
      showDetails={process.env.NODE_ENV === 'development'}
      fallbackComponent={({ error, retry }) => (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Application Error</h1>
            <p className="text-gray-600 mb-4">
              Something went wrong while loading the application.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap">{error?.message || 'Unknown error'}</pre>
              </details>
            )}
            <button
              onClick={retry}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      <Suspense fallback={<AppLoadingFallback />}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Network Status Monitor */}
          <LazyNetworkStatus position="top" />
          
          {/* Main Application Content */}
          <div className="flex-1 pt-16">
            <HomePage />
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
