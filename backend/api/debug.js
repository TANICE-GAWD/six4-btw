// Simple debug endpoint for Vercel deployment
module.exports = (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const debugInfo = {
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      method: req.method,
      url: req.url,
      headers: req.headers,
      env: {
        hasProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
        hasKeyFile: !!process.env.GOOGLE_CLOUD_KEY_FILE,
        nodeEnv: process.env.NODE_ENV,
        corsOrigin: process.env.CORS_ORIGIN
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      }
    };
    
    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};