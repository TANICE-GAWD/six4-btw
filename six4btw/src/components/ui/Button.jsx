import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-pressed': ariaPressed,
  loading = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px] min-w-[44px]';
  
  const variants = {
    primary: 'bg-blue-600 text-white focus:ring-blue-500 focus:ring-offset-2',
    secondary: 'bg-gray-200 text-gray-900 focus:ring-gray-500 focus:ring-offset-2',
    outline: 'border-2 border-blue-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 bg-transparent',
    danger: 'bg-red-600 text-white focus:ring-red-500 focus:ring-offset-2'
  };

  const hoverVariants = {
    primary: 'hover:bg-blue-700 active:bg-blue-800',
    secondary: 'hover:bg-gray-300 active:bg-gray-400',
    outline: 'hover:bg-blue-50 active:bg-blue-100',
    danger: 'hover:bg-red-700 active:bg-red-800'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm min-h-[36px]',
    medium: 'px-4 py-2 text-base min-h-[44px]',
    large: 'px-6 py-3 text-lg min-h-[48px]'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${hoverVariants[variant]} ${sizes[size]} ${className}`;

  
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    },
    tap: { 
      scale: 0.98,
      transition: { 
        duration: 0.1,
        ease: 'easeInOut'
      }
    },
    disabled: { 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled && !loading && onClick) {
        onClick(event);
      }
    }
  };
  
  return (
    <motion.button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      className={classes}
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "disabled"}
      whileTap={!disabled && !loading ? "tap" : "disabled"}
      whileFocus={{
        scale: 1.01,
        transition: { duration: 0.2 }
      }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center gap-2"
      >
        {loading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
        {children}
      </motion.span>
      
      {/* Screen reader loading state */}
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
    </motion.button>
  );
};

export default Button;