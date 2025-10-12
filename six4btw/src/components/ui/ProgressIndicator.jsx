/**
 * Enhanced Progress Indicator Component
 * Provides animated progress visualization with customizable styles
 */

import React from 'react';
import { motion } from 'framer-motion';
import { loadingAnimations, durations, easings } from '../../utils/animations.js';

/**
 * ProgressIndicator component with smooth animations
 * @param {Object} props 
 * @param {number} props.progress 
 * @param {string} props.size 
 * @param {string} props.variant 
 * @param {boolean} props.showPercentage 
 * @param {boolean} props.animated 
 * @param {string} props.label 
 * @param {string} props.className 
 */
const ProgressIndicator = ({
  progress = 0,
  size = 'medium',
  variant = 'default',
  showPercentage = true,
  animated = true,
  label = null,
  className = '',
  ...props
}) => {
  
  const clampedProgress = Math.max(0, Math.min(100, progress));

  
  const sizes = {
    small: {
      height: 'h-1',
      text: 'text-xs',
      spacing: 'space-y-1'
    },
    medium: {
      height: 'h-2',
      text: 'text-sm',
      spacing: 'space-y-2'
    },
    large: {
      height: 'h-3',
      text: 'text-base',
      spacing: 'space-y-3'
    }
  };

  
  const variants = {
    default: {
      bg: 'bg-gray-200',
      fill: 'bg-blue-500',
      text: 'text-gray-700',
      glow: 'shadow-blue-500/50'
    },
    success: {
      bg: 'bg-green-100',
      fill: 'bg-green-500',
      text: 'text-green-700',
      glow: 'shadow-green-500/50'
    },
    warning: {
      bg: 'bg-yellow-100',
      fill: 'bg-yellow-500',
      text: 'text-yellow-700',
      glow: 'shadow-yellow-500/50'
    },
    error: {
      bg: 'bg-red-100',
      fill: 'bg-red-500',
      text: 'text-red-700',
      glow: 'shadow-red-500/50'
    }
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  
  const progressBarVariants = {
    initial: { width: 0, opacity: 0.8 },
    animate: {
      width: `${clampedProgress}%`,
      opacity: 1,
      transition: {
        width: {
          duration: animated ? durations.slow : 0,
          ease: easings.easeOut
        },
        opacity: {
          duration: durations.fast
        }
      }
    }
  };

  
  const glowVariants = {
    animate: {
      boxShadow: [
        `0 0 0px ${variantConfig.glow}`,
        `0 0 10px ${variantConfig.glow}`,
        `0 0 0px ${variantConfig.glow}`
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: easings.easeInOut
      }
    }
  };

  
  const textVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: animated ? durations.normal : 0,
        duration: durations.fast,
        ease: easings.easeOut
      }
    }
  };

  return (
    <div className={`w-full ${sizeConfig.spacing} ${className}`} {...props}>
      {/* Label */}
      {label && (
        <motion.div
          className={`flex justify-between items-center ${sizeConfig.text} ${variantConfig.text}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: durations.fast }}
        >
          <span className="font-medium">{label}</span>
          {showPercentage && (
            <motion.span
              variants={textVariants}
              initial="initial"
              animate="animate"
              className="font-semibold"
            >
              {Math.round(clampedProgress)}%
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Progress Bar Container */}
      <div className={`w-full ${variantConfig.bg} rounded-full ${sizeConfig.height} overflow-hidden relative`}>
        {/* Progress Bar Fill */}
        <motion.div
          className={`${sizeConfig.height} ${variantConfig.fill} rounded-full relative`}
          variants={progressBarVariants}
          initial="initial"
          animate="animate"
        >
          {/* Animated shine effect */}
          {animated && clampedProgress > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%'],
                transition: {
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut'
                }
              }}
            />
          )}

          {/* Glow effect for high progress */}
          {animated && clampedProgress > 80 && (
            <motion.div
              className={`absolute inset-0 rounded-full`}
              variants={glowVariants}
              animate="animate"
            />
          )}
        </motion.div>

        {/* Pulse effect for active progress */}
        {animated && clampedProgress > 0 && clampedProgress < 100 && (
          <motion.div
            className={`absolute right-0 top-0 ${sizeConfig.height} w-1 ${variantConfig.fill} opacity-75`}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: easings.easeInOut
              }
            }}
          />
        )}
      </div>

      {/* Percentage below bar (if no label) */}
      {!label && showPercentage && (
        <motion.div
          className={`text-center ${sizeConfig.text} ${variantConfig.text} font-semibold`}
          variants={textVariants}
          initial="initial"
          animate="animate"
        >
          {Math.round(clampedProgress)}%
        </motion.div>
      )}
    </div>
  );
};

export default ProgressIndicator;