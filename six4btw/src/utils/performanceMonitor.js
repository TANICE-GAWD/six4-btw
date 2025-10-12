/**
 * Performance monitoring utilities
 * Tracks bundle size, loading times, and animation performance
 */

/**
 * Performance metrics collector
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      loadTime: 0,
      bundleSize: 0,
      animationFrames: 0,
      memoryUsage: 0
    };
    
    this.observers = [];
    this.startTime = performance.now();
  }
  
  /**
   * Initialize performance monitoring
   */
  init() {
    this.measureLoadTime();
    this.measureBundleSize();
    this.setupMemoryMonitoring();
    this.setupAnimationMonitoring();
  }
  
  /**
   * Measure initial page load time
   */
  measureLoadTime() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }
    }
  }
  
  /**
   * Estimate bundle size from loaded resources
   */
  measureBundleSize() {
    if (typeof window !== 'undefined' && window.performance) {
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;
      
      resources.forEach(resource => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });
      
      this.metrics.bundleSize = totalSize;
    }
  }
  
  /**
   * Monitor memory usage (if available)
   */
  setupMemoryMonitoring() {
    if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
      const updateMemory = () => {
        this.metrics.memoryUsage = window.performance.memory.usedJSHeapSize;
      };
      
      updateMemory();
      setInterval(updateMemory, 5000); // Update every 5 seconds
    }
  }
  
  /**
   * Monitor animation performance
   */
  setupAnimationMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrames = (currentTime) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        this.metrics.animationFrames = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    requestAnimationFrame(countFrames);
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Log performance warnings
   */
  checkPerformance() {
    const warnings = [];
    
    if (this.metrics.loadTime > 2000) {
      warnings.push(`Slow load time: ${this.metrics.loadTime}ms (target: <2000ms)`);
    }
    
    if (this.metrics.bundleSize > 1024 * 1024) { // 1MB
      warnings.push(`Large bundle size: ${(this.metrics.bundleSize / 1024 / 1024).toFixed(2)}MB (target: <1MB)`);
    }
    
    if (this.metrics.animationFrames < 55) {
      warnings.push(`Low FPS: ${this.metrics.animationFrames} (target: 60fps)`);
    }
    
    if (warnings.length > 0) {
      console.warn('Performance warnings:', warnings);
    }
    
    return warnings;
  }
}

/**
 * Web Vitals monitoring
 */
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;
  
  // Largest Contentful Paint
  const observeLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry.startTime > 2500) {
        console.warn(`LCP warning: ${lastEntry.startTime}ms (target: <2500ms)`);
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  };
  
  // First Input Delay
  const observeFID = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.processingStart - entry.startTime > 100) {
          console.warn(`FID warning: ${entry.processingStart - entry.startTime}ms (target: <100ms)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  };
  
  // Cumulative Layout Shift
  const observeCLS = () => {
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      if (clsValue > 0.1) {
        console.warn(`CLS warning: ${clsValue} (target: <0.1)`);
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  };
  
  // Initialize observers
  try {
    observeLCP();
    observeFID();
    observeCLS();
  } catch (error) {
    console.warn('Web Vitals monitoring not supported:', error);
  }
};

/**
 * Bundle analyzer helper
 */
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;
  
  const resources = performance.getEntriesByType('resource');
  const analysis = {
    javascript: 0,
    css: 0,
    images: 0,
    fonts: 0,
    other: 0
  };
  
  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    
    if (resource.name.includes('.js')) {
      analysis.javascript += size;
    } else if (resource.name.includes('.css')) {
      analysis.css += size;
    } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      analysis.images += size;
    } else if (resource.name.match(/\.(woff|woff2|ttf|otf)$/)) {
      analysis.fonts += size;
    } else {
      analysis.other += size;
    }
  });
  
  // Convert to KB and log
  Object.keys(analysis).forEach(key => {
    analysis[key] = Math.round(analysis[key] / 1024);
  });
  
  console.log('Bundle size analysis (KB):', analysis);
  return analysis;
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();