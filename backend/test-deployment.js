#!/usr/bin/env node

/**
 * Deployment Test Script
 * 
 * Tests the deployed API endpoints to ensure everything is working correctly.
 */

const https = require('https');
const http = require('http');

// Configuration
const DEPLOYMENT_URL = process.argv[2] || 'https://six4-btw-backend-main.vercel.app';

console.log(`🧪 Testing deployment at: ${DEPLOYMENT_URL}\n`);

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(path, description, expectedStatus = 200) {
  try {
    console.log(`Testing ${description}...`);
    const response = await makeRequest(`${DEPLOYMENT_URL}${path}`);
    
    const statusIcon = response.status === expectedStatus ? '✅' : '❌';
    console.log(`${statusIcon} ${path} - Status: ${response.status}`);
    
    if (response.data && typeof response.data === 'object') {
      console.log(`   Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`);
    }
    
    console.log('');
    return response.status === expectedStatus;
  } catch (error) {
    console.log(`❌ ${path} - Error: ${error.message}\n`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting deployment tests...\n');
  
  const tests = [
    { path: '/', description: 'Root endpoint', expectedStatus: 200 },
    { path: '/health', description: 'Health check', expectedStatus: 200 },
    { path: '/api/health', description: 'API health check', expectedStatus: 200 },
    { path: '/api/status', description: 'API status', expectedStatus: 200 },
    { path: '/api/vision/health', description: 'Vision service health', expectedStatus: 200 },
    { path: '/nonexistent', description: '404 handling', expectedStatus: 404 }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.path, test.description, test.expectedStatus);
    if (success) passed++;
  }
  
  console.log(`📊 Test Results: ${passed}/${total} tests passed\n`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Your deployment is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
    console.log('💡 Common issues:');
    console.log('   - Environment variables not set correctly');
    console.log('   - Google Cloud credentials not configured');
    console.log('   - CORS origin not matching your frontend domain');
  }
  
  console.log(`\n🔗 Your API is available at: ${DEPLOYMENT_URL}`);
}

// Run the tests
runTests().catch(console.error);