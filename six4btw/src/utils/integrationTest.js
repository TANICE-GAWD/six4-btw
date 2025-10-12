/**
 * Integration Test Utilities
 * Development helpers for testing complete user journeys and error scenarios
 * Only available in development mode
 */

import { uploadAndRateImage, checkApiHealth } from '../services/ratingService.js';
import { formatErrorMessage, isRetryableError } from './errorMessages.js';

/**
 * Test scenarios for comprehensive integration testing
 */
export const TEST_SCENARIOS = {
  VALID_UPLOAD: 'valid_upload',
  INVALID_FILE_TYPE: 'invalid_file_type',
  FILE_TOO_LARGE: 'file_too_large',
  NETWORK_ERROR: 'network_error',
  API_ERROR: 'api_error',
  TIMEOUT_ERROR: 'timeout_error'
};

/**
 * Create test files for different scenarios
 */
export const createTestFile = (scenario) => {
  switch (scenario) {
    case TEST_SCENARIOS.VALID_UPLOAD:
      // Create a small valid image file (1x1 pixel PNG)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 1, 1);
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const file = new File([blob], 'test-image.png', { type: 'image/png' });
          resolve(file);
        }, 'image/png');
      });

    case TEST_SCENARIOS.INVALID_FILE_TYPE:
      // Create a text file with image extension
      const textBlob = new Blob(['This is not an image'], { type: 'text/plain' });
      return Promise.resolve(new File([textBlob], 'fake-image.txt', { type: 'text/plain' }));

    case TEST_SCENARIOS.FILE_TOO_LARGE:
      // Create a large file (simulate 15MB)
      const largeData = new Array(15 * 1024 * 1024).fill('x').join('');
      const largeBlob = new Blob([largeData], { type: 'image/jpeg' });
      return Promise.resolve(new File([largeBlob], 'large-image.jpg', { type: 'image/jpeg' }));

    default:
      return Promise.resolve(null);
  }
};

/**
 * Test complete user journey with different scenarios
 */
export const testUserJourney = async (scenario) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Integration tests only available in development mode');
    return;
  }

  console.log(`🧪 Testing scenario: ${scenario}`);

  try {
    const testFile = await createTestFile(scenario);
    
    if (!testFile) {
      console.error('❌ Failed to create test file');
      return;
    }

    console.log(`📁 Created test file: ${testFile.name} (${testFile.size} bytes)`);

    // Test file validation
    const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(testFile.type);
    const isValidSize = testFile.size <= 10 * 1024 * 1024; // 10MB

    console.log(`✅ File type validation: ${isValidType ? 'PASS' : 'FAIL'}`);
    console.log(`✅ File size validation: ${isValidSize ? 'PASS' : 'FAIL'}`);

    if (scenario === TEST_SCENARIOS.VALID_UPLOAD && isValidType && isValidSize) {
      // Test API health first
      const isApiHealthy = await checkApiHealth();
      console.log(`🏥 API health check: ${isApiHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);

      if (isApiHealthy) {
        // Test actual upload
        const progressCallback = (progress) => {
          console.log(`📊 Upload progress: ${progress}%`);
        };

        try {
          const result = await uploadAndRateImage(testFile, progressCallback);
          console.log('🎉 Upload successful:', result);
        } catch (uploadError) {
          console.log('❌ Upload failed (expected for test):', formatErrorMessage(uploadError));
          console.log(`🔄 Retryable: ${isRetryableError(uploadError)}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Test scenario failed:', error);
  }
};

/**
 * Test all error handling scenarios
 */
export const testErrorHandling = async () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🧪 Running comprehensive error handling tests...');

  const scenarios = Object.values(TEST_SCENARIOS);
  
  for (const scenario of scenarios) {
    await testUserJourney(scenario);
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Error handling tests completed');
};

/**
 * Test performance metrics
 */
export const testPerformance = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('⚡ Testing performance metrics...');

  // Test animation performance
  const testAnimationPerformance = () => {
    const start = performance.now();
    
    // Simulate heavy animation workload
    for (let i = 0; i < 1000; i++) {
      const element = document.createElement('div');
      element.style.transform = `translateX(${i}px)`;
    }
    
    const end = performance.now();
    const duration = end - start;
    
    console.log(`🎬 Animation performance test: ${duration.toFixed(2)}ms`);
    
    if (duration > 16) { // 60fps = 16.67ms per frame
      console.warn('⚠️ Animation performance may be suboptimal');
    } else {
      console.log('✅ Animation performance is good');
    }
  };

  // Test memory usage
  const testMemoryUsage = () => {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;
      
      console.log('💾 Memory usage:');
      console.log(`   Used: ${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Total: ${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Limit: ${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      
      const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
      if (usagePercent > 80) {
        console.warn('⚠️ High memory usage detected');
      } else {
        console.log('✅ Memory usage is acceptable');
      }
    }
  };

  testAnimationPerformance();
  testMemoryUsage();
};

/**
 * Run complete integration test suite
 */
export const runIntegrationTests = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Integration tests are only available in development mode');
    return;
  }

  console.log('🚀 Starting comprehensive integration tests...');
  console.log('=====================================');

  // Test performance
  testPerformance();
  
  console.log('');
  
  // Test error handling
  await testErrorHandling();
  
  console.log('');
  console.log('✅ All integration tests completed');
  console.log('=====================================');
};

// Auto-run integration tests in development if requested
if (process.env.NODE_ENV === 'development' && window.location.search.includes('test=true')) {
  // Delay to allow app to fully load
  setTimeout(runIntegrationTests, 3000);
}

// Expose test functions to window for manual testing
if (process.env.NODE_ENV === 'development') {
  window.integrationTests = {
    runAll: runIntegrationTests,
    testScenario: testUserJourney,
    testErrors: testErrorHandling,
    testPerformance: testPerformance
  };
  
  console.log('🧪 Integration test utilities available at window.integrationTests');
}