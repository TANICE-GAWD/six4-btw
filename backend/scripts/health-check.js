

const http = require('http');
const config = require('../src/config/environment');

const HEALTH_CHECK_URL = `http://localhost:${config.port}/health`;
const TIMEOUT = config.healthCheck.timeout;

/**
 
 * @returns {Promise<Object>}
 */
function performHealthCheck() {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = http.get(HEALTH_CHECK_URL, { timeout: TIMEOUT }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        try {
          const healthData = JSON.parse(data);
          
          resolve({
            success: res.statusCode === 200,
            statusCode: res.statusCode,
            responseTime,
            data: healthData
          });
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Health check timeout after ${TIMEOUT}ms`));
    });
    
    req.on('error', (error) => {
      reject(new Error(`Health check failed: ${error.message}`));
    });
  });
}


async function main() {
  console.log(`Performing health check on ${HEALTH_CHECK_URL}...`);
  
  try {
    const result = await performHealthCheck();
    
    console.log(`✅ Health check completed in ${result.responseTime}ms`);
    console.log(`Status Code: ${result.statusCode}`);
    console.log(`Server Status: ${result.data.data?.status || 'Unknown'}`);
    
    if (result.success) {
      console.log('🎉 Server is healthy!');
      
      
      if (result.data.data) {
        const healthData = result.data.data;
        console.log(`Environment: ${healthData.environment}`);
        console.log(`Uptime: ${Math.round(healthData.uptime)}s`);
        console.log(`Version: ${healthData.version}`);
        
        if (healthData.services) {
          console.log('Service Status:');
          Object.entries(healthData.services).forEach(([service, status]) => {
            console.log(`  - ${service}: ${status.status}`);
          });
        }
      }
      
      process.exit(0);
    } else {
      console.error('Server is unhealthy');
      console.error('Response:', JSON.stringify(result.data, null, 2));
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Health check failed:', error.message);
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Health Check Script

Usage: node health-check.js [options]

Options:
  --help, -h    Show this help message
  
Environment Variables:
  PORT                    Server port (default: 3001)
  HEALTH_CHECK_TIMEOUT    Timeout in milliseconds (default: 10000)

Exit Codes:
  0    Health check passed
  1    Health check failed or server unhealthy
  
Examples:
  node health-check.js
  PORT=8080 node health-check.js
  HEALTH_CHECK_TIMEOUT=5000 node health-check.js
`);
  process.exit(0);
}


main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});