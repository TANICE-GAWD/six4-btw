/**
 * Image compression utilities for optimizing file uploads
 * Reduces file size while maintaining acceptable quality
 */

/**
 * Compression configuration
 */
export const COMPRESSION_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8, // 80% quality
  maxSizeKB: 2048, // 2MB target size
  format: 'image/jpeg' // Default compression format
};

/**
 * Compresses an image file using canvas
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const config = { ...COMPRESSION_CONFIG, ...options };
  
  // Skip compression for small files
  if (file.size <= config.maxSizeKB * 1024) {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        const { width, height } = calculateDimensions(
          img.width, 
          img.height, 
          config.maxWidth, 
          config.maxHeight
        );
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with compressed data
              const compressedFile = new File(
                [blob], 
                file.name, 
                { 
                  type: config.format,
                  lastModified: Date.now()
                }
              );
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          config.format,
          config.quality
        );
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    // Load image
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculates optimal dimensions while maintaining aspect ratio
 * @param {number} originalWidth - Original image width
 * @param {number} originalHeight - Original image height
 * @param {number} maxWidth - Maximum allowed width
 * @param {number} maxHeight - Maximum allowed height
 * @returns {Object} - New dimensions {width, height}
 */
export const calculateDimensions = (originalWidth, originalHeight, maxWidth, maxHeight) => {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  // Scale down if image is larger than max dimensions
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
};

/**
 * Estimates compression ratio for a file
 * @param {File} file - The image file
 * @returns {number} - Estimated compression ratio (0-1)
 */
export const estimateCompressionRatio = (file) => {
  const sizeKB = file.size / 1024;
  
  // Estimate based on file size
  if (sizeKB < 500) return 0.1; // Small files, minimal compression
  if (sizeKB < 1000) return 0.3; // Medium files, moderate compression
  if (sizeKB < 2000) return 0.5; // Large files, significant compression
  return 0.7; // Very large files, aggressive compression
};

/**
 * Checks if image should be compressed
 * @param {File} file - The image file
 * @returns {boolean} - True if compression is recommended
 */
export const shouldCompress = (file) => {
  const sizeKB = file.size / 1024;
  return sizeKB > COMPRESSION_CONFIG.maxSizeKB;
};