/**
 * Utility functions index
 * Centralized exports for all utility modules
 */

// File validation utilities
export {
  SUPPORTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
  isValidImageType,
  isValidFileSize,
  formatFileSize,
  validateImageFile
} from './fileValidation.js';

// Error handling utilities
export {
  FILE_ERRORS,
  API_ERRORS,
  APP_ERRORS,
  RETRYABLE_ERRORS,
  formatErrorMessage,
  isRetryableError,
  createError
} from './errorMessages.js';

// Comprehensive error handler
export {
  ERROR_SEVERITY,
  ERROR_CATEGORIES,
  globalErrorHandler,
  handleError,
  createErrorWithContext
} from './errorHandler.js';

// Animation utilities and configurations
export {
  easings,
  durations,
  pageTransitions,
  buttonInteractions,
  loadingAnimations,
  feedbackAnimations,
  staggerAnimations,
  hoverEffects,
  createStaggeredAnimation,
  createDelayedAnimation,
  createProgressAnimation,
  createOptimizedAnimation,
  createTransformAnimation,
  createAccessibleAnimation
} from './animations.js';

// Performance optimization utilities
export {
  OPTIMIZED_ANIMATIONS,
  ANIMATION_VARIANTS,
  prefersReducedMotion,
  getAnimationConfig,
  AnimationPerformanceMonitor,
  createOptimizedMotion,
  debounceAnimation,
  createViewportAnimationObserver
} from './animationOptimization.js';

// Image compression utilities
export {
  COMPRESSION_CONFIG,
  compressImage,
  calculateDimensions,
  estimateCompressionRatio,
  shouldCompress
} from './imageCompression.js';

// Lazy loading utilities
export {
  createLazyComponent,
  preloadComponent,
  createViewportLazyComponent,
  LAZY_LOAD_CONFIG
} from './lazyLoading.jsx';

// Performance monitoring
export {
  PerformanceMonitor,
  performanceMonitor,
  measureWebVitals,
  analyzeBundleSize
} from './performanceMonitor.js';

// Accessibility utilities
export {
  checkColorContrast,
  validateKeyboardNavigation,
  validateAriaAttributes,
  validateTouchTargets,
  auditElementAccessibility,
  prefersReducedMotion as prefersReducedMotionUtil,
  prefersHighContrast,
  getAccessibleAnimationDuration,
  focusManagement
} from './accessibilityHelpers.js';