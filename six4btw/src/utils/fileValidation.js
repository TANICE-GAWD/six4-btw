/**
 * File validation utilities for image upload
 * Handles type checking, size validation, and error generation
 */

import { compressImage, shouldCompress } from './imageCompression.js';

// Supported image types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

// File size limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

/**
 * Validates if a file is a supported image type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is supported
 */
export const isValidImageType = (file) => {
  if (!file || !file.type) {
    return false;
  }
  return SUPPORTED_IMAGE_TYPES.includes(file.type.toLowerCase());
};

/**
 * Validates if a file size is within limits
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file size is acceptable
 */
export const isValidFileSize = (file) => {
  if (!file || typeof file.size !== 'number') {
    return false;
  }
  return file.size <= MAX_FILE_SIZE;
};

/**
 * Formats file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Comprehensive file validation with optional compression
 * @param {File} file - The file to validate
 * @param {boolean} autoCompress - Whether to automatically compress large files
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validateImageFile = async (file, autoCompress = true) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (!isValidImageType(file)) {
    errors.push('Invalid file type. Please upload an image file (JPG, PNG, GIF, WebP)');
  }
  
  let processedFile = file;
  let wasCompressed = false;
  
  // Attempt compression for large files
  if (autoCompress && shouldCompress(file) && isValidImageType(file)) {
    try {
      processedFile = await compressImage(file);
      wasCompressed = true;
    } catch (error) {
      console.warn('Image compression failed:', error);
      // Continue with original file if compression fails
    }
  }
  
  if (!isValidFileSize(processedFile)) {
    errors.push(`File size must be under ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    file: {
      name: processedFile.name,
      size: processedFile.size,
      type: processedFile.type,
      lastModified: processedFile.lastModified
    },
    processedFile,
    wasCompressed,
    originalSize: file.size,
    compressionRatio: wasCompressed ? (file.size - processedFile.size) / file.size : 0
  };
};

/**
 * Synchronous version of validateImageFile (without compression)
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid flag and errors array
 */
export const validateImageFileSync = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  if (!isValidImageType(file)) {
    errors.push('Invalid file type. Please upload an image file (JPG, PNG, GIF, WebP)');
  }
  
  if (!isValidFileSize(file)) {
    errors.push(`File size must be under ${formatFileSize(MAX_FILE_SIZE)}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  };
};