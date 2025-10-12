

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader, ResultsDisplay } from '../components/features/index.js';
import ErrorDisplay from '../components/ui/ErrorDisplay.jsx';
import { PoliteLiveRegion, AssertiveLiveRegion } from '../components/ui/LiveRegion.jsx';
import { withErrorBoundary } from '../components/ui/withErrorBoundary.jsx';
import { useAccessibility } from '../hooks/useAccessibility.js';
import { pageTransitions, feedbackAnimations, createDelayedAnimation } from '../utils/animations.js';


const APP_STAGES = {
  AWAITING_UPLOAD: 'awaiting_upload',
  PROCESSING: 'processing', 
  DISPLAYING_RESULTS: 'displaying_results'
};

/**
 * @returns {JSX.Element} 
 */
export const HomePage = () => {
  
  const [appState, setAppState] = useState({
    stage: APP_STAGES.AWAITING_UPLOAD,
    apiResponse: null,
    errorMessage: null,
    uploadedFile: null
  });

  
  const { announce, prefersReducedMotion } = useAccessibility();

  /**

   * @param {File} file 
   */
  const handleUploadStart = useCallback((file) => {
    setAppState(prevState => ({
      ...prevState,
      stage: APP_STAGES.PROCESSING,
      errorMessage: null,
      uploadedFile: file
    }));
    
    
    announce(`Starting upload of ${file.name}`, 'polite');
  }, [announce]);

  /**

   * @param {Object} response 
   */
  const handleUploadSuccess = useCallback((response) => {
    setAppState(prevState => ({
      ...prevState,
      stage: APP_STAGES.DISPLAYING_RESULTS,
      apiResponse: response.data || response, 
      errorMessage: null
    }));
    
    
    const score = response.data?.score || response.score;
    announce(`Upload successful! Your image received a rating of ${score} percent.`, 'polite');
  }, [announce]);

  /**

   * @param {string} errorMessage 
   */
  const handleUploadError = useCallback((errorMessage) => {
    setAppState(prevState => ({
      ...prevState,
      stage: APP_STAGES.AWAITING_UPLOAD,
      errorMessage: errorMessage,
      apiResponse: null
    }));
    
    
    announce(`Upload failed: ${errorMessage}`, 'assertive');
  }, [announce]);


  const handleReset = useCallback(() => {
    setAppState({
      stage: APP_STAGES.AWAITING_UPLOAD,
      apiResponse: null,
      errorMessage: null,
      uploadedFile: null
    });
    
    
    announce('Ready to upload a new image', 'polite');
  }, [announce]);

  


  const renderCurrentStage = () => {
    return (
      <AnimatePresence mode="wait">
        {(appState.stage === APP_STAGES.AWAITING_UPLOAD || appState.stage === APP_STAGES.PROCESSING) && (
          <motion.div
            key="uploader"
            variants={pageTransitions.slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ImageUploader
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </motion.div>
        )}
        
        {appState.stage === APP_STAGES.DISPLAYING_RESULTS && (
          <motion.div
            key="results"
            variants={pageTransitions.slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ResultsDisplay
              apiResponse={appState.apiResponse}
              originalImage={appState.uploadedFile}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Skip to main content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Header */}
      <motion.header 
        className="bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Are you a Performative Male?
            </motion.h1>
            <motion.p 
              className="mt-2 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Upload an image and get a performance rating
              By Prince Sharma under the banner of TANICE
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        role="main"
        aria-live="polite"
        aria-label="Image rating application"
      >
        <div className="flex justify-center">
          {renderCurrentStage()}
        </div>
        
        {/* Global Error Display */}
        <AnimatePresence>
          {appState.errorMessage && appState.stage === APP_STAGES.AWAITING_UPLOAD && (
            <motion.div 
              className="mt-6 max-w-2xl mx-auto"
              variants={feedbackAnimations.error}
              initial="initial"
              animate="animate"
              exit="exit"
              role="alert"
              aria-live="assertive"
            >
              <ErrorDisplay
                error={appState.errorMessage}
                onRetry={() => {
                  
                  setAppState(prev => ({ ...prev, errorMessage: null }));
                }}
                onDismiss={() => setAppState(prev => ({ ...prev, errorMessage: null }))}
                showRetry={true}
                showDismiss={true}
                variant="card"
                severity="error"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Live regions for screen reader announcements */}
        <PoliteLiveRegion 
          message={
            appState.stage === APP_STAGES.PROCESSING 
              ? 'Processing your image upload...' 
              : appState.stage === APP_STAGES.DISPLAYING_RESULTS 
                ? `Results ready. Your image scored ${appState.apiResponse?.score || 0}%.`
                : ''
          }
        />
        
        <AssertiveLiveRegion 
          message={appState.errorMessage || ''}
        />
      </main>

      {/* Footer */}
      <motion.footer 
        className="bg-white border-t border-gray-200 mt-8 sm:mt-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

        </div>
      </motion.footer>
    </motion.div>
  );
};


export default withErrorBoundary(HomePage, {
  isCritical: false,
  fallbackComponent: ({ error, retry, reset }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <ErrorDisplay
          error={error}
          onRetry={retry}
          onDismiss={reset}
          showRetry={true}
          showDismiss={true}
          variant="card"
          severity="error"
        />
      </div>
    </div>
  ),
});