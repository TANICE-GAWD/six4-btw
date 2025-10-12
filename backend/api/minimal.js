// Minimal test for Vercel deployment debugging
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  try {
    const response = {
      success: true,
      message: 'Minimal serverless function working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'not-set',
        hasGoogleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        hasGoogleCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_KEY_FILE),
        corsOrigin: process.env.CORS_ORIGIN || 'not-set'
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};