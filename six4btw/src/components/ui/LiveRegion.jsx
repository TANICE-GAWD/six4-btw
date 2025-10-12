/**
 * LiveRegion Component
 * 
 * Provides screen reader announcements for dynamic content updates.
 * Used for accessibility compliance with WCAG guidelines.
 * 
 * Requirements: 5.4, 5.5
 */

import React from 'react';

/**
 * LiveRegion component for screen reader announcements
 * @param {Object} props 
 * @param {string} props.message 
 * @param {string} props.priority 
 * @param {boolean} props.atomic 
 * @param {string} props.relevant 
 * @param {string} props.className 
 * @returns {JSX.Element} LiveRegion component
 */
const LiveRegion = ({
  message = '',
  priority = 'polite',
  atomic = true,
  relevant = 'additions text',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`sr-only ${className}`}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role="status"
      {...props}
    >
      {message}
    </div>
  );
};

/**
 * AssertiveLiveRegion - For urgent announcements
 */
export const AssertiveLiveRegion = ({ message, ...props }) => (
  <LiveRegion
    message={message}
    priority="assertive"
    role="alert"
    {...props}
  />
);

/**
 * PoliteLiveRegion - For non-urgent announcements
 */
export const PoliteLiveRegion = ({ message, ...props }) => (
  <LiveRegion
    message={message}
    priority="polite"
    role="status"
    {...props}
  />
);

export default LiveRegion;