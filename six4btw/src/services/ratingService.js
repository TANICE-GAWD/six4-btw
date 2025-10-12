

import axios from 'axios';
import { formatErrorMessage, createError } from '../utils/errorMessages.js';

// API configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000, 
  maxFileSize: 10 * 1024 * 1024, 
};


const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
    
    
    const transformedError = transformApiError(error);
    return Promise.reject(transformedError);
  }
);

/**
 
 * @param {Error} error 
 * @returns {Object} 
 */
const transformApiError = (error) => {
  if (error.response) {
    
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return createError('VALIDATION_ERROR', data?.message || 'Invalid request');
      case 413:
        return createError('FILE_TOO_LARGE', 'File size exceeds limit');
      case 429:
        return createError('RATE_LIMIT', 'Too many requests');
      case 500:
        return createError('SERVER_ERROR', 'Server processing error');
      case 503:
        return createError('SERVICE_UNAVAILABLE', 'Service temporarily unavailable');
      default:
        return createError('API_ERROR', data?.message || 'API request failed');
    }
  } else if (error.request) {
    
    return createError('NETWORK_ERROR', 'Network connection failed');
  } else if (error.code === 'ECONNABORTED') {
    
    return createError('TIMEOUT', 'Request timeout');
  } else {
    
    return createError('UNKNOWN_ERROR', error.message || 'Unknown error occurred');
  }
};

/**
 
 * @param {File} file 
 * @param {Function} onProgress 
 * @returns {Promise<Object>} 
 */
export const uploadAndRateImage = async (file, onProgress = null) => {
  try {
    
    if (file.size > API_CONFIG.maxFileSize) {
      throw createError('FILE_TOO_LARGE', 'File size exceeds 10MB limit');
    }
    
    
    const formData = new FormData();
    formData.append('image', file);
    
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };
    
    
    const response = await apiClient.post('/rate', formData, config);
    
    
    console.log('API Response:', response.data);
    
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.error('Invalid response structure:', response.data);
      throw createError('INVALID_RESPONSE', 'Invalid response format');
    }
    
    const { data } = response.data;
    console.log('Extracted data:', data);
    console.log('Score type:', typeof data.score, 'Value:', data.score);
    
    
    if (typeof data.score !== 'number' || isNaN(data.score)) {
      console.error('Invalid score:', data.score, typeof data.score);
      throw createError('INVALID_RESPONSE', 'Invalid score in response');
    }
    
    return {
      success: true,
      data: {
        score: data.score,
        description: data.description || data.message || '',
        processingTime: data.processingTime || 0,
        imageId: data.imageId || null,
        labels: data.labels || [],
        detectedItems: data.detectedItems || [],
        metadata: data.metadata || {},
        debug: data.debug || {},
      },
    };
    
  } catch (error) {
    
    if (error.code && error.message) {
      throw error;
    }
    
    
    throw transformApiError(error);
  }
};

/**
 
 * @returns {Promise<boolean>} 
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

/**
 
 * @returns {Object} 
 */
export const getApiConfig = () => {
  return {
    baseURL: API_CONFIG.baseURL,
    timeout: API_CONFIG.timeout,
    maxFileSize: API_CONFIG.maxFileSize,
  };
};


export { apiClient };