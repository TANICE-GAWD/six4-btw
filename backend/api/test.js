// Simple test endpoint for debugging Vercel deployment
const express = require('express');
const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Vercel deployment test successful',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    hasGoogleProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    hasGoogleCredentials: !!(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_KEY_FILE)
  });
});

app.get('/env-check', (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID ? 'SET' : 'NOT_SET',
    GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ? 'SET' : 'NOT_SET',
    GOOGLE_CLOUD_KEY_FILE: process.env.GOOGLE_CLOUD_KEY_FILE ? 'SET' : 'NOT_SET',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'NOT_SET'
  };
  
  res.json({
    success: true,
    environment: envVars,
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableRoutes: ['/test', '/env-check']
  });
});

module.exports = app;