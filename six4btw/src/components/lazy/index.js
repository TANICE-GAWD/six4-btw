/**
 * Lazy-loaded component exports
 * These components are loaded on-demand to improve initial bundle size
 */

import { createLazyComponent, LAZY_LOAD_CONFIG } from '../../utils/lazyLoading.jsx';


export const LazyNetworkStatus = createLazyComponent(
  () => import('../ui/NetworkStatus.jsx'),
  LAZY_LOAD_CONFIG.ui
);


export const LazyErrorDisplay = createLazyComponent(
  () => import('../ui/ErrorDisplay.jsx'),
  LAZY_LOAD_CONFIG.ui
);


export const LazyRetryButton = createLazyComponent(
  () => import('../ui/RetryButton.jsx'),
  LAZY_LOAD_CONFIG.ui
);


export const LazyProgressIndicator = createLazyComponent(
  () => import('../ui/ProgressIndicator.jsx'),
  LAZY_LOAD_CONFIG.ui
);


export const preloadComponents = {
  networkStatus: () => import('../ui/NetworkStatus.jsx'),
  errorDisplay: () => import('../ui/ErrorDisplay.jsx'),
  retryButton: () => import('../ui/RetryButton.jsx'),
  progressIndicator: () => import('../ui/ProgressIndicator.jsx'),
};