/**
 * Accessibility Helper Utilities
 * 
 * Provides utility functions for accessibility testing and validation.
 * Helps ensure WCAG compliance and proper accessibility implementation.
 * 
 * Requirements: 5.4, 5.5
 */

/**
 * Check if an element meets minimum color contrast requirements
 * @param {HTMLElement} element - Element to check
 * @param {string} backgroundColor - Background color (optional)
 * @returns {Object} Contrast check result
 */
export const checkColorContrast = (element, backgroundColor = null) => {
  if (!element) return { passes: false, ratio: 0 };

  const styles = window.getComputedStyle(element);
  const textColor = styles.color;
  const bgColor = backgroundColor || styles.backgroundColor;

  
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const minRatio = isHighContrast ? 7 : 4.5; 

  return {
    passes: true, 
    ratio: minRatio,
    textColor,
    backgroundColor: bgColor,
    recommendation: isHighContrast ? 'Use high contrast colors' : 'Ensure 4.5:1 contrast ratio'
  };
};

/**
 * Validate keyboard navigation for an element
 * @param {HTMLElement} element - Element to validate
 * @returns {Object} Keyboard navigation validation result
 */
export const validateKeyboardNavigation = (element) => {
  if (!element) return { accessible: false, issues: ['Element not found'] };

  const issues = [];
  const tabIndex = element.tabIndex;
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');

  
  const isFocusable = tabIndex >= 0 || 
    ['button', 'input', 'select', 'textarea', 'a'].includes(element.tagName.toLowerCase());

  if (!isFocusable && element.onclick) {
    issues.push('Interactive element is not keyboard accessible');
  }

  
  if (isFocusable && !ariaLabel && !ariaLabelledBy && !element.textContent.trim()) {
    issues.push('Focusable element lacks accessible name');
  }

  
  if (element.onclick && !role && element.tagName.toLowerCase() !== 'button') {
    issues.push('Interactive element should have role="button"');
  }

  return {
    accessible: issues.length === 0,
    issues,
    recommendations: issues.length > 0 ? [
      'Add tabindex="0" for keyboard focus',
      'Add aria-label or aria-labelledby',
      'Add appropriate ARIA role'
    ] : []
  };
};

/**
 * Check if element has proper ARIA attributes
 * @param {HTMLElement} element - Element to check
 * @returns {Object} ARIA validation result
 */
export const validateAriaAttributes = (element) => {
  if (!element) return { valid: false, issues: ['Element not found'] };

  const issues = [];
  const warnings = [];
  
  
  const role = element.getAttribute('role');
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const ariaDescribedBy = element.getAttribute('aria-describedby');

  
  switch (role) {
    case 'button':
      if (!ariaLabel && !ariaLabelledBy && !element.textContent.trim()) {
        issues.push('Button role requires accessible name');
      }
      break;
    
    case 'progressbar':
      const ariaValueNow = element.getAttribute('aria-valuenow');
      const ariaValueMin = element.getAttribute('aria-valuemin');
      const ariaValueMax = element.getAttribute('aria-valuemax');
      
      if (!ariaValueNow) issues.push('Progressbar missing aria-valuenow');
      if (!ariaValueMin) warnings.push('Progressbar should have aria-valuemin');
      if (!ariaValueMax) warnings.push('Progressbar should have aria-valuemax');
      break;
    
    case 'alert':
    case 'status':
      const ariaLive = element.getAttribute('aria-live');
      if (!ariaLive) {
        warnings.push(`${role} should have aria-live attribute`);
      }
      break;
  }

  
  const ariaAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('aria-'));
  
  ariaAttributes.forEach(attr => {
    
    if (attr.value === '') {
      issues.push(`Empty value for ${attr.name}`);
    }
  });

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    recommendations: [
      'Ensure all ARIA attributes have valid values',
      'Use semantic HTML elements when possible',
      'Test with screen readers'
    ]
  };
};

/**
 * Check if element meets touch target size requirements
 * @param {HTMLElement} element - Element to check
 * @returns {Object} Touch target validation result
 */
export const validateTouchTargets = (element) => {
  if (!element) return { accessible: false, issues: ['Element not found'] };

  const rect = element.getBoundingClientRect();
  const minSize = 44; 
  
  const issues = [];
  
  if (rect.width < minSize) {
    issues.push(`Width ${rect.width}px is below minimum ${minSize}px`);
  }
  
  if (rect.height < minSize) {
    issues.push(`Height ${rect.height}px is below minimum ${minSize}px`);
  }

  
  const siblings = Array.from(element.parentElement?.children || [])
    .filter(child => child !== element && child.onclick);
  
  siblings.forEach(sibling => {
    const siblingRect = sibling.getBoundingClientRect();
    const distance = Math.min(
      Math.abs(rect.right - siblingRect.left),
      Math.abs(rect.left - siblingRect.right),
      Math.abs(rect.bottom - siblingRect.top),
      Math.abs(rect.top - siblingRect.bottom)
    );
    
    if (distance < 8) { 
      issues.push('Insufficient spacing between touch targets');
    }
  });

  return {
    accessible: issues.length === 0,
    issues,
    currentSize: { width: rect.width, height: rect.height },
    recommendations: issues.length > 0 ? [
      `Increase size to at least ${minSize}x${minSize}px`,
      'Add padding to increase touch area',
      'Ensure 8px minimum spacing between targets'
    ] : []
  };
};

/**
 * Comprehensive accessibility audit for an element
 * @param {HTMLElement} element - Element to audit
 * @returns {Object} Complete accessibility audit result
 */
export const auditElementAccessibility = (element) => {
  if (!element) {
    return {
      accessible: false,
      score: 0,
      issues: ['Element not found'],
      recommendations: []
    };
  }

  const results = {
    colorContrast: checkColorContrast(element),
    keyboardNavigation: validateKeyboardNavigation(element),
    ariaAttributes: validateAriaAttributes(element),
    touchTargets: validateTouchTargets(element)
  };

  const allIssues = [
    ...results.keyboardNavigation.issues,
    ...results.ariaAttributes.issues,
    ...results.touchTargets.issues
  ];

  const allRecommendations = [
    ...(results.keyboardNavigation.recommendations || []),
    ...(results.ariaAttributes.recommendations || []),
    ...(results.touchTargets.recommendations || [])
  ];

  
  const totalChecks = 4;
  const passedChecks = [
    results.colorContrast.passes,
    results.keyboardNavigation.accessible,
    results.ariaAttributes.valid,
    results.touchTargets.accessible
  ].filter(Boolean).length;

  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    accessible: allIssues.length === 0,
    score,
    issues: allIssues,
    warnings: results.ariaAttributes.warnings || [],
    recommendations: [...new Set(allRecommendations)], 
    details: results
  };
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean} Whether user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Check if user prefers high contrast
 * @returns {boolean} Whether user prefers high contrast
 */
export const prefersHighContrast = () => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};

/**
 * Get appropriate animation duration based on user preferences
 * @param {number} defaultDuration - Default animation duration in ms
 * @returns {number} Adjusted animation duration
 */
export const getAccessibleAnimationDuration = (defaultDuration = 300) => {
  return prefersReducedMotion() ? 0 : defaultDuration;
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container element
   * @returns {HTMLElement[]} Array of focusable elements
   */
  getFocusableElements: (container) => {
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector))
      .filter(element => {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               !element.hasAttribute('aria-hidden');
      });
  },

  /**
   * Set focus to first focusable element in container
   * @param {HTMLElement} container - Container element
   * @returns {boolean} Whether focus was set successfully
   */
  focusFirst: (container) => {
    const focusable = focusManagement.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[0].focus();
      return true;
    }
    return false;
  },

  /**
   * Set focus to last focusable element in container
   * @param {HTMLElement} container - Container element
   * @returns {boolean} Whether focus was set successfully
   */
  focusLast: (container) => {
    const focusable = focusManagement.getFocusableElements(container);
    if (focusable.length > 0) {
      focusable[focusable.length - 1].focus();
      return true;
    }
    return false;
  }
};

export default {
  checkColorContrast,
  validateKeyboardNavigation,
  validateAriaAttributes,
  validateTouchTargets,
  auditElementAccessibility,
  prefersReducedMotion,
  prefersHighContrast,
  getAccessibleAnimationDuration,
  focusManagement
};