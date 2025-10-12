
export const OPTIMIZED_ANIMATIONS = {
  
  microInteraction: {
    type: "tween",
    duration: 0.15,
    ease: "easeOut"
  },
  
  
  uiTransition: {
    type: "tween", 
    duration: 0.3,
    ease: [0.4, 0.0, 0.2, 1] 
  },
  
  
  pageTransition: {
    type: "tween",
    duration: 0.4,
    ease: "easeInOut"
  },
  
  
  ratingMeter: {
    type: "tween",
    duration: 2,
    ease: "easeOut"
  },
  
  
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
  },
  
  
  reducedMotion: {
    type: "tween",
    duration: 0.01,
    ease: "linear"
  }
};

/**
 * Performance-optimized animation variants
 */
export const ANIMATION_VARIANTS = {
  
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  },
  
  
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }
};

/**
 * Checks if user prefers reduced motion
 * @returns {boolean} - True if reduced motion is preferred
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Gets appropriate animation config based on user preferences
 * @param {Object} normalConfig - Normal animation configuration
 * @param {Object} reducedConfig - Reduced motion configuration
 * @returns {Object} - Appropriate animation configuration
 */
export const getAnimationConfig = (normalConfig, reducedConfig = OPTIMIZED_ANIMATIONS.reducedMotion) => {
  return prefersReducedMotion() ? reducedConfig : normalConfig;
};

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  constructor() {
    this.frameCount = 0;
    this.startTime = 0;
    this.isMonitoring = false;
  }
  
  startMonitoring() {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.isMonitoring = true;
    this.monitorFrame();
  }
  
  stopMonitoring() {
    this.isMonitoring = false;
    const duration = performance.now() - this.startTime;
    const fps = (this.frameCount / duration) * 1000;
    
    if (fps < 55) {
      console.warn(`Animation performance warning: ${fps.toFixed(1)} FPS (target: 60 FPS)`);
    }
    
    return { fps, duration, frameCount: this.frameCount };
  }
  
  monitorFrame() {
    if (!this.isMonitoring) return;
    
    this.frameCount++;
    requestAnimationFrame(() => this.monitorFrame());
  }
}

/**
 * Optimized CSS properties for animations (GPU-accelerated)
 */
export const GPU_OPTIMIZED_PROPERTIES = [
  'transform',
  'opacity',
  'filter'
];

/**
 * Properties to avoid animating (cause layout/paint)
 */
export const AVOID_ANIMATING = [
  'width',
  'height',
  'padding',
  'margin',
  'border-width',
  'top',
  'left',
  'right',
  'bottom'
];

/**
 * Creates a performance-optimized motion component
 * @param {Object} config - Animation configuration
 * @returns {Object} - Optimized motion props
 */
export const createOptimizedMotion = (config = {}) => {
  const {
    animation = 'uiTransition',
    variants = 'fadeIn',
    layoutId,
    ...otherProps
  } = config;
  
  return {
    transition: getAnimationConfig(OPTIMIZED_ANIMATIONS[animation]),
    variants: ANIMATION_VARIANTS[variants],
    layoutId,
    
    style: { willChange: 'transform, opacity' },
    ...otherProps
  };
};

/**
 * Debounced animation trigger to prevent excessive animations
 * @param {Function} animationFn - Animation function to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced animation function
 */
export const debounceAnimation = (animationFn, delay = 100) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => animationFn(...args), delay);
  };
};

/**
 * Intersection Observer for viewport-based animations
 * @param {Object} options - Observer options
 * @returns {Object} - Observer utilities
 */
export const createViewportAnimationObserver = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;
  
  const observedElements = new Map();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const element = entry.target;
      const callback = observedElements.get(element);
      
      if (entry.isIntersecting && callback) {
        callback(true);
        
        if (triggerOnce) {
          observer.unobserve(element);
          observedElements.delete(element);
        }
      } else if (!entry.isIntersecting && callback && !triggerOnce) {
        callback(false);
      }
    });
  }, { threshold, rootMargin });
  
  return {
    observe: (element, callback) => {
      observedElements.set(element, callback);
      observer.observe(element);
    },
    
    unobserve: (element) => {
      observer.unobserve(element);
      observedElements.delete(element);
    },
    
    disconnect: () => {
      observer.disconnect();
      observedElements.clear();
    }
  };
};