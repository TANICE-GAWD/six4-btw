import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getAnimationConfig, prefersReducedMotion, OPTIMIZED_ANIMATIONS } from '../../utils/animationOptimization.js';

const RatingMeter = ({ 
  score, 
  animationDuration = 2000, 
  size = 'medium', 
  showPercentage = true,
  className = '',
  ...props 
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const controls = useAnimation();
  
  const sizes = {
    small: {
      container: 'w-24 h-24',
      text: 'text-lg',
      strokeWidth: 6
    },
    medium: {
      container: 'w-32 h-32',
      text: 'text-2xl',
      strokeWidth: 8
    },
    large: {
      container: 'w-48 h-48',
      text: 'text-4xl',
      strokeWidth: 10
    }
  };
  
  const sizeConfig = sizes[size];
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getStrokeColor = (score) => {
    if (score >= 80) return '#16a34a'; 
    if (score >= 60) return '#ca8a04'; 
    if (score >= 40) return '#ea580c'; 
    return '#dc2626'; 
  };
  
  
  const animationConfig = useMemo(() => {
    const duration = prefersReducedMotion() ? 0.1 : animationDuration / 1000;
    return getAnimationConfig({
      ...OPTIMIZED_ANIMATIONS.ratingMeter,
      duration
    });
  }, [animationDuration]);

  
  const animateNumber = useCallback(() => {
    if (prefersReducedMotion()) {
      setDisplayScore(score);
      return;
    }

    const startTime = Date.now();
    let rafId;
    
    const updateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3); 
      
      setDisplayScore(Math.round(easeOutProgress * score));
      
      if (progress < 1) {
        rafId = requestAnimationFrame(updateScore);
      }
    };
    
    rafId = requestAnimationFrame(updateScore);
    
    
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [score, animationDuration]);

  useEffect(() => {
    
    const animateCircle = async () => {
      await controls.start({
        strokeDashoffset: circumference - (score / 100) * circumference,
        transition: animationConfig
      });
    };
    
    
    animateCircle();
    const cleanup = animateNumber();
    
    return cleanup;
  }, [score, controls, circumference, animationConfig, animateNumber]);
  
  return (
    <div 
      className={`relative ${sizeConfig.container} ${className}`}
      role="progressbar"
      aria-valuenow={displayScore}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Performance rating: ${displayScore} out of 100${showPercentage ? ' percent' : ''}`}
      aria-live="polite"
      aria-atomic="true"
      tabIndex="0"
      {...props}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={sizeConfig.strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        
        {/* Animated progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke={getStrokeColor(score)}
          strokeWidth={sizeConfig.strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
          className="drop-shadow-sm"
          style={{ willChange: 'stroke-dashoffset' }} 
        />
      </svg>
      
      {/* Score display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className={`font-bold ${sizeConfig.text} ${getScoreColor(score)}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={getAnimationConfig({
              ...OPTIMIZED_ANIMATIONS.microInteraction,
              delay: prefersReducedMotion() ? 0 : animationDuration / 2000,
            })}
            style={{ willChange: 'transform, opacity' }} 
            aria-hidden="true"
          >
            {displayScore}{showPercentage && '%'}
          </motion.div>
          
          {/* Screen reader announcement for score changes */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {displayScore === score ? `Final rating: ${score} out of 100` : `Current rating: ${displayScore} out of 100`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingMeter;