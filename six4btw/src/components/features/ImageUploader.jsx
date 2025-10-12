/**
 * ImageUploader Feature Component
 * 
 * Provides drag-and-drop image upload functionality with:
 * - React Dropzone integration for file selection
 * - File validation and preview generation
 * - Visual feedback for drag states
 * - Upload progress tracking
 * - Error handling and display
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useImageUpload } from '../../hooks/useImageUpload.js';
import { validateImageFile } from '../../utils/fileValidation.js';
import { Button, Spinner, ProgressIndicator } from '../ui/index.js';
import ErrorDisplay from '../ui/ErrorDisplay.jsx';
import { withErrorBoundary } from '../ui/withErrorBoundary.jsx';

/**
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onUploadSuccess 
 * @param {Function} props.onUploadError 
 * @param {Function} props.onUploadStart 
 * @returns {JSX.Element} 
 */
export const ImageUploader = ({ 
  onUploadSuccess, 
  onUploadError, 
  onUploadStart 
}) => {
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState(null);
  
  
  const {
    uploadImage,
    isUploading,
    uploadProgress,
    error: uploadError,
    clearError,
    resetUploadState
  } = useImageUpload();

  /**
   * Handle file selection and validation
   * @param {File[]} acceptedFiles -
   * @param {File[]} rejectedFiles -
   */
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    
    setValidationError(null);
    clearError();
    
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(error => error.code === 'file-invalid-type')) {
        setValidationError('Not an image file!');
      } else if (rejection.errors.some(error => error.code === 'file-too-large')) {
        setValidationError('File size must be under 10MB');
      } else {
        setValidationError('Invalid file selected');
      }
      return;
    }
    
    
    if (acceptedFiles.length > 1) {
      setValidationError('Please select only one image file');
      return;
    }
    
    const file = acceptedFiles[0];
    if (!file) return;
    
    
    const validation = await validateImageFile(file);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      return;
    }
    
    
    setSelectedFile(file);
    generatePreview(file);
  }, [clearError]);

  /**
   * Generate preview URL for selected image
   * @param {File} file - Image file to preview
   */
  const generatePreview = useCallback((file) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [previewUrl]);

  /**
   * Handle upload initiation
   */
  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setValidationError('Please select an image to upload');
      return;
    }
    
    try {
      
      onUploadStart?.(selectedFile);
      
      
      const response = await uploadImage(selectedFile);
      
      
      onUploadSuccess?.(response);
      
    } catch (error) {
      
      onUploadError?.(error.message || 'Upload failed');
    }
  }, [selectedFile, uploadImage, onUploadStart, onUploadSuccess, onUploadError]);

  /**
   * Reset component to initial state
   */
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    resetUploadState();
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl, resetUploadState]);

  
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: 10 * 1024 * 1024, 
    multiple: false,
    disabled: isUploading
  });

  
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  
  const dropzoneVariants = {
    idle: {
      scale: 1,
      borderColor: '#d1d5db', 
      backgroundColor: '#ffffff',
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.01,
      borderColor: '#9ca3af', 
      backgroundColor: '#f9fafb', 
      transition: { duration: 0.2 }
    },
    dragActive: {
      scale: 1.02,
      borderColor: '#60a5fa', 
      backgroundColor: '#eff6ff', 
      transition: { duration: 0.2 }
    },
    dragReject: {
      scale: 0.98,
      borderColor: '#f87171', 
      backgroundColor: '#fef2f2', 
      transition: { duration: 0.2 }
    },
    uploading: {
      scale: 1,
      borderColor: '#d1d5db', 
      backgroundColor: '#f9fafb', 
      transition: { duration: 0.2 }
    }
  };

  
  const getDropzoneState = () => {
    if (isUploading) return 'uploading';
    if (isDragReject || validationError) return 'dragReject';
    if (isDragAccept || isDragActive) return 'dragActive';
    return 'idle';
  };

  
  const getDropzoneClasses = () => {
    const baseClasses = 'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer relative overflow-hidden';
    
    if (isUploading) {
      return `${baseClasses} cursor-not-allowed`;
    }
    
    if (isDragReject || validationError) {
      return `${baseClasses} text-red-600`;
    }
    
    if (isDragAccept || isDragActive) {
      return `${baseClasses} text-blue-600`;
    }
    
    return `${baseClasses} text-gray-600`;
  };

  
  const getCurrentError = () => {
    return validationError || uploadError;
  };

  return (
    <motion.div 
      className="w-full max-w-2xl mx-auto px-4 sm:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Main upload area */}
      <motion.div
        {...(selectedFile ? {} : getRootProps())}
        className={`${getDropzoneClasses()} min-h-[300px]`}
        variants={dropzoneVariants}
        animate={getDropzoneState()}
        whileHover={!isUploading && !selectedFile ? "hover" : undefined}
        role={selectedFile ? undefined : "button"}
        tabIndex={isUploading || selectedFile ? -1 : 0}
        aria-label={
          isUploading 
            ? `Uploading image, ${uploadProgress}% complete`
            : selectedFile 
              ? `Selected file: ${selectedFile.name}`
              : 'Click or drag and drop to upload an image file. Supports JPG, PNG, GIF, WebP up to 10MB.'
        }
        aria-describedby="upload-instructions upload-status"
        aria-live="polite"
        aria-atomic="true"
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isUploading && !selectedFile) {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input[type="file"]');
            input?.click();
          }
        }}
      >
        {!selectedFile && (
          <input 
            {...getInputProps()} 
            aria-label="Choose image file to upload"
            aria-describedby="upload-instructions"
          />
        )}
        
        <AnimatePresence mode="wait" initial={false}>
          {isUploading ? (
            
            <motion.div 
              key="uploading"
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              role="status"
              aria-live="polite"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
              >
                <Spinner size="large" />
              </motion.div>
              <div>
                <motion.p 
                  className="text-base sm:text-lg font-medium text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  id="upload-status"
                  aria-live="polite"
                >
                  Uploading your image...
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <ProgressIndicator
                    progress={uploadProgress}
                    size="medium"
                    variant="default"
                    showPercentage={true}
                    animated={true}
                    label="Upload Progress"
                    aria-describedby="upload-status"
                  />
                </motion.div>
                
                {/* Screen reader progress announcements */}
                <div className="sr-only" aria-live="polite" aria-atomic="false">
                  {uploadProgress > 0 && uploadProgress < 100 && 
                    `Upload progress: ${uploadProgress} percent complete`
                  }
                  {uploadProgress === 100 && "Upload complete, processing image..."}
                </div>
              </div>
            </motion.div>
          ) : selectedFile ? (
            
            <motion.div 
              key="preview"
              className="space-y-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-full sm:w-80 h-32 sm:h-48 flex items-center justify-center">
                  <motion.img
                    src={previewUrl}
                    alt={`Preview of selected image: ${selectedFile.name}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    loading="lazy"
                    tabIndex="0"
                    role="img"
                  />
                </div>
                <motion.div 
                  className="mt-3 text-center px-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <p className="font-medium text-gray-700 text-sm sm:text-base break-words">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            
            <motion.div 
              key="default"
              className="space-y-4 px-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="text-4xl sm:text-6xl text-gray-400"
                animate={{ 
                  scale: isDragActive ? 1.1 : 1,
                  rotate: isDragActive ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.3 }}
                aria-hidden="true"
              >
                📸
              </motion.div>
              <div>
                <motion.p 
                  className="text-lg sm:text-xl font-medium text-gray-700"
                  animate={{ 
                    scale: isDragActive ? 1.05 : 1,
                    color: isDragActive ? '#2563eb' : '#374151'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isDragActive 
                    ? 'Drop your image here!' 
                    : 'Drag & drop an image here'
                  }
                </motion.p>
                <motion.p 
                  className="text-gray-500 mt-2 text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  or click to select a file
                </motion.p>
                <motion.p 
                  id="upload-instructions"
                  className="text-xs sm:text-sm text-gray-400 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Supports JPG, PNG, GIF, WebP (max 10MB). Use keyboard navigation with Tab, Enter, or Space keys.
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action buttons - separate from dropzone when file is selected */}
      {selectedFile && !isUploading && (
        <motion.div 
          className="mt-4 flex flex-col sm:flex-row gap-3 justify-center px-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Button
            onClick={handleUpload}
            variant="primary"
            disabled={isUploading}
            className="w-full sm:w-auto min-w-[180px]"
            aria-describedby="upload-button-desc"
            aria-label={`Upload ${selectedFile.name} and get performance rating`}
          >
            Upload & Rate Image
          </Button>
          <Button
            onClick={handleReset}
            variant="secondary"
            disabled={isUploading}
            className="w-full sm:w-auto min-w-[180px]"
            aria-label="Remove current selection and choose a different image file"
          >
            Choose Different Image
          </Button>
        </motion.div>
      )}
      
      {selectedFile && (
        <div id="upload-button-desc" className="sr-only">
          Upload the selected image to get an AI performance rating
        </div>
      )}

      {/* Error display */}
      <AnimatePresence>
        {getCurrentError() && (
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorDisplay
              error={getCurrentError()}
              onRetry={uploadError ? () => {
                clearError();
                if (selectedFile) {
                  handleUpload();
                }
              } : undefined}
              onDismiss={() => {
                if (uploadError) {
                  clearError();
                } else {
                  setValidationError(null);
                }
              }}
              showRetry={!!uploadError && !!selectedFile}
              showDismiss={true}
              variant="card"
              severity={validationError ? 'warning' : 'error'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


export default withErrorBoundary(ImageUploader, {
  isCritical: false,
  enableGracefulDegradation: true,
  fallbackContent: (
    <div className="w-full max-w-2xl mx-auto p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-4xl text-gray-400 mb-4">📸</div>
      <p className="text-gray-600">Image upload temporarily unavailable</p>
      <p className="text-sm text-gray-500 mt-2">Please refresh the page to try again</p>
    </div>
  ),
});
