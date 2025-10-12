/**
 * useAccessibility Hook
 * 
 * Provides utilities for managing accessibility features including:
 * - Focus management
 * - Keyboard navigation
 * - Screen reader announcements
 * - Reduced motion preferences
 * 
 * Requirements: 5.4, 5.5
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Hook for managing focus and accessibility features
 * @returns {Object} Accessibility utilities
 */
export const useAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const announcementRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for high contrast preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setHighContrast(mediaQuery.matches);

    const handleChange = (e) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - 'polite' or 'assertive'
   */
  const announce = useCallback((message, priority = 'polite') => {
    if (!announcementRef.current) {
      // Create announcement element if it doesn't exist
      const element = document.createElement('div');
      element.setAttribute('aria-live', priority);
      element.setAttribute('aria-atomic', 'true');
      element.className = 'sr-only';
      element.id = 'accessibility-announcements';
      document.body.appendChild(element);
      announcementRef.current = element;
    }

    // Clear previous message and set new one
    announcementRef.current.textContent = '';
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = message;
      }
    }, 100);
  }, []);

  /**
   * Focus management utility
   * @param {HTMLElement|string} element - Element or selector to focus
   * @param {Object} options - Focus options
   */
  const focusElement = useCallback((element, options = {}) => {
    const { preventScroll = false, delay = 0 } = options;
    
    const focus = () => {
      let targetElement = element;
      
      if (typeof element === 'string') {
        targetElement = document.querySelector(element);
      }
      
      if (targetElement && typeof targetElement.focus === 'function') {
        targetElement.focus({ preventScroll });
      }
    };

    if (delay > 0) {
      setTimeout(focus, delay);
    } else {
      focus();
    }
  }, []);

  /**
   * Trap focus within a container
   * @param {HTMLElement} container - Container element
   * @returns {Function} Cleanup function
   */
  const trapFocus = useCallback((container) => {
    if (!container) return () => {};

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    
    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /**
   * Handle keyboard navigation for custom components
   * @param {Object} handlers - Key handlers object
   * @returns {Function} Event handler
   */
  const handleKeyNavigation = useCallback((handlers = {}) => {
    return (event) => {
      const { key } = event;
      const handler = handlers[key] || handlers[key.toLowerCase()];
      
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };
  }, []);

  /**
   * Get ARIA attributes for dynamic content
   * @param {Object} options - Configuration options
   * @returns {Object} ARIA attributes
   */
  const getAriaAttributes = useCallback((options = {}) => {
    const {
      live = 'polite',
      atomic = true,
      relevant = 'additions text',
      busy = false
    } = options;

    return {
      'aria-live': live,
      'aria-atomic': atomic,
      'aria-relevant': relevant,
      'aria-busy': busy
    };
  }, []);

  /**
   * Check if element is visible to screen readers
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether element is accessible
   */
  const isAccessible = useCallback((element) => {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      element.hasAttribute('aria-hidden') ||
      element.hasAttribute('hidden')
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (announcementRef.current) {
        document.body.removeChild(announcementRef.current);
      }
    };
  }, []);

  return {
    // State
    prefersReducedMotion,
    highContrast,
    
    // Methods
    announce,
    focusElement,
    trapFocus,
    handleKeyNavigation,
    getAriaAttributes,
    isAccessible,
    
    // Utilities
    skipToContent: () => focusElement('#main-content'),
    announceError: (message) => announce(message, 'assertive'),
    announceSuccess: (message) => announce(message, 'polite'),
  };
};

/**
 * Hook for managing focus restoration
 * @param {boolean} shouldRestore - Whether to restore focus
 * @returns {Object} Focus restoration utilities
 */
export const useFocusRestore = (shouldRestore = true) => {
  const previousFocusRef = useRef(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (shouldRestore && previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [shouldRestore]);

  return { saveFocus, restoreFocus };
};

/**
 * Hook for managing live regions
 * @param {string} initialMessage - Initial message
 * @returns {Object} Live region utilities
 */
export const useLiveRegion = (initialMessage = '') => {
  const [message, setMessage] = useState(initialMessage);
  const [priority, setPriority] = useState('polite');

  const announce = useCallback((newMessage, newPriority = 'polite') => {
    setMessage(''); // Clear first to ensure announcement
    setPriority(newPriority);
    
    setTimeout(() => {
      setMessage(newMessage);
    }, 100);
  }, []);

  const clear = useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    priority,
    announce,
    clear,
    ariaLive: priority,
    ariaAtomic: true
  };
};

export default useAccessibility;