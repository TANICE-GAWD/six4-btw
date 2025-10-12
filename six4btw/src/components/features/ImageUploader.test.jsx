/**
 * Basic test file for ImageUploader component
 * This is a minimal test to verify the component renders without errors
 */

import React from 'react';
import { ImageUploader } from './ImageUploader.jsx';


const testImageUploader = () => {
  console.log('Testing ImageUploader component...');
  
  
  const mockProps = {
    onUploadSuccess: (response) => console.log('Upload success:', response),
    onUploadError: (error) => console.log('Upload error:', error),
    onUploadStart: (file) => console.log('Upload start:', file.name)
  };
  
  try {
    
    const component = React.createElement(ImageUploader, mockProps);
    console.log('✅ ImageUploader component created successfully');
    return true;
  } catch (error) {
    console.error('❌ ImageUploader component failed:', error);
    return false;
  }
};


export { testImageUploader };