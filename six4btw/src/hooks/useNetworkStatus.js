
import { useState, useEffect, useCallback } from 'react';
import { checkApiHealth } from '../services/ratingService.js';

/**
 
 * @param {Object} options
 * @param {number} options.checkInterval
 * @param {boolean} options.enableApiHealthCheck 
 * @returns {Object}
 */
export const useNetworkStatus = ({
  checkInterval = 30000, 
  enableApiHealthCheck = true,
} = {}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isApiHealthy, setIsApiHealthy] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    
    if (enableApiHealthCheck) {
      checkHealth();
    }
  }, [enableApiHealthCheck]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setIsApiHealthy(false);
  }, []);

  /**
   * Check API health status
   */
  const checkHealth = useCallback(async () => {
    if (!isOnline || isChecking) {
      return;
    }

    setIsChecking(true);
    
    try {
      const healthy = await checkApiHealth();
      setIsApiHealthy(healthy);
      setLastChecked(new Date());
    } catch (error) {
      console.warn('API health check failed:', error);
      setIsApiHealthy(false);
    } finally {
      setIsChecking(false);
    }
  }, [isOnline, isChecking]);


  const refreshStatus = useCallback(async () => {
    setIsOnline(navigator.onLine);
    if (enableApiHealthCheck && navigator.onLine) {
      await checkHealth();
    }
  }, [enableApiHealthCheck, checkHealth]);

  
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  
  useEffect(() => {
    if (!enableApiHealthCheck || !isOnline) {
      return;
    }

    
    checkHealth();

    
    const interval = setInterval(checkHealth, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [enableApiHealthCheck, isOnline, checkHealth, checkInterval]);

  
  const isConnected = isOnline && (enableApiHealthCheck ? isApiHealthy : true);

  return {
    // Status
    isOnline,
    isApiHealthy,
    isConnected,
    isChecking,
    lastChecked,
    
    // Actions
    checkHealth,
    refreshStatus,
    
    
    hasNetworkIssue: !isOnline,
    hasApiIssue: isOnline && !isApiHealthy,
    connectionStatus: (() => {
      if (!isOnline) return 'offline';
      if (!isApiHealthy) return 'api-unavailable';
      return 'connected';
    })(),
  };
};

export default useNetworkStatus;