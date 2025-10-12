#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 * 
 * This script helps set up environment variables for Vercel deployment.
 * Run this script to get the commands needed to set up your Vercel environment.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Environment Setup for Image Rating API\n');

try {
  // Read the service account key
  const keyPath = path.join(__dirname, 'config', 'service-account-key.json');
  const keyData = fs.readFileSync(keyPath, 'utf8');
  
  // Parse to validate it's valid JSON
  const keyJson = JSON.parse(keyData);
  
  console.log('✅ Service account key found and validated\n');
  
  console.log('📋 Run these commands to set up your Vercel environment variables:\n');
  
  // Project ID
  console.log(`vercel env add GOOGLE_CLOUD_PROJECT_ID`);
  console.log(`Value: ${keyJson.project_id}\n`);
  
  // Credentials JSON (minified)
  const minifiedKey = JSON.stringify(keyJson);
  console.log(`vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON`);
  console.log(`Value: ${minifiedKey}\n`);
  
  // CORS Origin
  console.log(`vercel env add CORS_ORIGIN`);
  console.log(`Value: https://your-frontend-domain.com\n`);
  
  console.log('🔧 Additional optional environment variables:\n');
  
  console.log(`vercel env add MAX_FILE_SIZE`);
  console.log(`Value: 10485760\n`);
  
  console.log(`vercel env add ALLOWED_FILE_TYPES`);
  console.log(`Value: image/jpeg,image/png,image/gif,image/webp\n`);
  
  console.log('📝 Notes:');
  console.log('1. Replace "https://your-frontend-domain.com" with your actual frontend URL');
  console.log('2. You can add multiple CORS origins separated by commas');
  console.log('3. Run "vercel env ls" to see all your environment variables');
  console.log('4. Run "vercel --prod" to deploy to production\n');
  
  console.log('🎯 Quick setup (copy and paste):');
  console.log('-----------------------------------');
  console.log(`echo "${keyJson.project_id}" | vercel env add GOOGLE_CLOUD_PROJECT_ID production`);
  console.log(`echo '${minifiedKey}' | vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production`);
  console.log(`echo "https://your-frontend-domain.com" | vercel env add CORS_ORIGIN production`);
  
} catch (error) {
  console.error('❌ Error reading service account key:', error.message);
  console.log('\n💡 Make sure you have the service account key at: backend/config/service-account-key.json');
  process.exit(1);
}