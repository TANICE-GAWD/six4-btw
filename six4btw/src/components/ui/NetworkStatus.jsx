/**
 * Network Status Component
 * Displays network connectivity status and provides recovery options
 */

import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus.js';
import RetryButton from './RetryButton.jsx';

/**
 * 
 * @param {Object} props 
 * @param {boolean} props.showWhenOnline 
 * @param {string} props.position 
 * @param {Function} props.onRetry
 */
const NetworkStatus = ({
  showWhenOnline = false,
  position = 'top',
  onRetry,
  className = '',
}) => {
  const {
    isOnline,
    isApiHealthy,
    isConnected,
    isChecking,
    connectionStatus,
    refreshStatus,
    hasNetworkIssue,
    hasApiIssue,
  } = useNetworkStatus({
    checkInterval: 300000, 
    enableApiHealthCheck: false, 
  });

  
  if (isConnected && !showWhenOnline) {
    return null;
  }

  const handleRetry = async () => {
    await refreshStatus();
    if (onRetry) {
      onRetry();
    }
  };

  
  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'offline':
        return {
          message: 'No internet connection',
          bgColor: 'bg-red-500',
          textColor: 'text-white',
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 8v4m0 4h.01" />
            </svg>
          ),
        };
      case 'api-unavailable':
        return {
          message: 'Service temporarily unavailable',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white',
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
        };
      case 'connected':
        return {
          message: 'Connected',
          bgColor: 'bg-green-500',
          textColor: 'text-white',
          icon: (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      default:
        return {
          message: 'Checking connection...',
          bgColor: 'bg-gray-500',
          textColor: 'text-white',
          icon: (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
        };
    }
  };

  const statusInfo = getStatusInfo();

  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 z-50';
      case 'inline':
      default:
        return '';
    }
  };

  const positionClasses = getPositionClasses();

  
  if (position === 'inline') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-md ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.icon}
          <span>{statusInfo.message}</span>
        </div>
        {!isConnected && (
          <RetryButton
            onRetry={handleRetry}
            error={{ code: hasNetworkIssue ? 'NETWORK_ERROR' : 'API_ERROR' }}
            className="text-xs"
          >
            Retry
          </RetryButton>
        )}
      </div>
    );
  }

  
  return (
    <div className={`${positionClasses} ${className}`}>
      <div className={`${statusInfo.bgColor} ${statusInfo.textColor} px-4 py-3`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.message}</span>
            {isChecking && (
              <span className="text-sm opacity-75">Checking...</span>
            )}
          </div>
          
          {!isConnected && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRetry}
                disabled={isChecking}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isChecking ? 'Checking...' : 'Retry'}
              </button>
              
              {hasNetworkIssue && (
                <span className="text-sm opacity-75">
                  Check your internet connection
                </span>
              )}
              
              {hasApiIssue && (
                <span className="text-sm opacity-75">
                  Our servers are experiencing issues
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;