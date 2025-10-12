/**
 * Animation Utilities and Configurations
 * Centralized animation variants and utilities for consistent motion design
 * Optimized for 60fps performance
 */

import { 
  OPTIMIZED_ANIMATIONS, 
  ANIMATION_VARIANTS, 
  getAnimationConfig, 
  prefersReducedMotion 
} from './animationOptimization.js';

// Common easing functions (performance optimized)
export const easings = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  spring: { type: "spring", stiffness: 300, damping: 30 }
};

// Common durations (optimized for performance)
export const durations = {
  micro: 0.1,   // For micro-interactions
  fast: 0.15,   // For quick feedback
  normal: 0.3,  // For standard transitions
  slow: 0.5,    // For complex animations
  slower: 0.8   // For dramatic effects
};

// Page transition variants
export const pageTransitions = {
  slideUp: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn
      }
    }
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn
      }
    }
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: durations.normal,
        ease: easings.bounce
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn
      }
    }
  }
};

// Button interaction variants
export const buttonInteractions = {
  default: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { 
        duration: durations.fast,
        ease: easings.easeOut
      }
    },
    tap: { 
      scale: 0.98,
      transition: { 
        duration: 0.1,
        ease: easings.easeInOut
      }
    }
  },

  subtle: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.01,
      transition: { 
        duration: durations.fast,
        ease: easings.easeOut
      }
    },
    tap: { 
      scale: 0.99,
      transition: { 
        duration: 0.1,
        ease: easings.easeInOut
      }
    }
  },

  bounce: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        duration: durations.fast,
        ease: easings.bounce
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        duration: 0.1,
        ease: easings.easeInOut
      }
    }
  }
};

// Loading and progress animations
export const loadingAnimations = {
  spin: {
    animate: { rotate: 360 },
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  },

  pulse: {
    animate: { 
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7]
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut
    }
  },

  bounce: {
    animate: { 
      y: [0, -10, 0]
    },
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: easings.easeInOut
    }
  },

  progressBar: {
    initial: { width: 0 },
    animate: (progress) => ({
      width: `${progress}%`,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
      }
    })
  }
};

// Error and feedback animations
export const feedbackAnimations = {
  shake: {
    animate: {
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.4,
        ease: easings.easeInOut
      }
    }
  },

  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: durations.normal,
        ease: easings.bounce
      }
    }
  },

  error: {
    initial: { opacity: 0, y: 10, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn
      }
    }
  }
};

// Stagger animations for lists
export const staggerAnimations = {
  container: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  item: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut
      }
    }
  }
};

// Hover effects for interactive elements
export const hoverEffects = {
  lift: {
    whileHover: { 
      y: -2,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      transition: { duration: durations.fast }
    }
  },

  glow: {
    whileHover: { 
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
      transition: { duration: durations.fast }
    }
  },

  scale: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: durations.fast }
    }
  }
};

// Performance-optimized utility functions
export const createStaggeredAnimation = (children, staggerDelay = 0.1) => ({
  animate: {
    transition: getAnimationConfig({
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    })
  }
});

export const createDelayedAnimation = (baseAnimation, delay = 0) => ({
  ...baseAnimation,
  animate: {
    ...baseAnimation.animate,
    transition: getAnimationConfig({
      ...baseAnimation.animate.transition,
      delay
    })
  }
});

export const createProgressAnimation = (progress, duration = durations.normal) => ({
  initial: { width: 0 },
  animate: { 
    width: `${progress}%`,
    transition: getAnimationConfig({
      duration,
      ease: easings.easeOut
    })
  }
});

// Performance monitoring utilities
export const createOptimizedAnimation = (animationType, customConfig = {}) => {
  const baseConfig = OPTIMIZED_ANIMATIONS[animationType] || OPTIMIZED_ANIMATIONS.uiTransition;
  return getAnimationConfig({ ...baseConfig, ...customConfig });
};

// GPU-optimized transform animations
export const createTransformAnimation = (transforms, duration = durations.normal) => ({
  animate: transforms,
  transition: getAnimationConfig({
    duration,
    ease: easings.easeOut
  }),
  style: { willChange: 'transform' } // Hint to browser for GPU acceleration
});

// Reduced motion safe animations
export const createAccessibleAnimation = (normalAnimation, reducedAnimation = null) => {
  if (prefersReducedMotion()) {
    return reducedAnimation || OPTIMIZED_ANIMATIONS.reducedMotion;
  }
  return normalAnimation;
};