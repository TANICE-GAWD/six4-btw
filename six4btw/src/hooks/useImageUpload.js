

import { useState, useCallback, useRef } from 'react';
import { uploadAndRateImage } from '../services/ratingService.js';
import { formatErrorMessage, isRetryableError } from '../utils/errorMessages.js';

/**
 
 * @returns {Object} 
 */
export const useImageUpload = () => {
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  
  
  const isMountedRef = useRef(true);
  
  /**
   * Progress callback for upload tracking
   * @param {number} progress - Upload progress percentage (0-100)
   */
  const handleProgress = useCallback((progress) => {
    if (isMountedRef.current) {
      setUploadProgress(progress);
    }
  }, []);
  

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setLastUploadedFile(null);
  }, []);
  
  /**
   * Upload an image file and get rating
   * @param {File} file 
   * @returns {Promise<Object>} 
   */
  const uploadImage = useCallback(async (file) => {
    
    if (!file) {
      const errorMsg = 'No file provided for upload';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    
    clearError();
    setIsUploading(true);
    setUploadProgress(0);
    setLastUploadedFile(file);
    
    try {
      
      const response = await uploadAndRateImage(file, handleProgress);
      
      
      if (isMountedRef.current) {
        setIsUploading(false);
        setUploadProgress(100);
      }
      
      return response;
      
    } catch (uploadError) {
      
      if (isMountedRef.current) {
        setIsUploading(false);
        setUploadProgress(0);
        
        
        const formattedError = formatErrorMessage(uploadError, 'upload');
        setError(formattedError);
      }
      
      
      throw uploadError;
    }
  }, [handleProgress, clearError]);
  
  /**
   * Retry the last upload operation
   * @returns {Promise<Object>} 
   */
  const retryUpload = useCallback(async () => {
    if (!lastUploadedFile) {
      const errorMsg = 'No previous upload to retry';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
    
    return uploadImage(lastUploadedFile);
  }, [lastUploadedFile, uploadImage]);
  
  /**
  
   * @returns {boolean} 
   */
  const canRetry = useCallback(() => {
    return error && lastUploadedFile && isRetryableError(error);
  }, [error, lastUploadedFile]);

  const cleanup = useCallback(() => {
    isMountedRef.current = false;
  }, []);
  
  
  return {
    
    isUploading,
    uploadProgress,
    error,
    lastUploadedFile,
    
    
    uploadImage,
    retryUpload,
    clearError,
    resetUploadState,
    canRetry,
    cleanup,
    
    
    hasError: !!error,
    isRetryable: canRetry(),
  };
};

export default useImageUpload;