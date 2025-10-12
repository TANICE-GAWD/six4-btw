#!/usr/bin/env node

/**
 * Vercel Deployment Helper Script
 * 
 * This script helps prepare and deploy the backend to Vercel
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Vercel Deployment Helper\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ Vercel CLI not found. Install it with: npm i -g vercel');
  process.exit(1);
}

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'package.json',
  'server.js'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// Check environment variables
console.log('\n🔧 Environment Variables Check:');
const requiredEnvVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'CORS_ORIGIN'
];

const optionalEnvVars = [
  'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  'GOOGLE_CLOUD_KEY_FILE',
  'MAX_FILE_SIZE',
  'ALLOWED_FILE_TYPES'
];

console.log('\nRequired (must be set in Vercel):');
requiredEnvVars.forEach(envVar => {
  console.log(`  - ${envVar}`);
});

console.log('\nOptional (have defaults):');
optionalEnvVars.forEach(envVar => {
  console.log(`  - ${envVar}`);
});

// Check Google Cloud credentials
console.log('\n🔐 Google Cloud Credentials:');
const hasKeyFile = process.env.GOOGLE_CLOUD_KEY_FILE && fs.existsSync(process.env.GOOGLE_CLOUD_KEY_FILE);
const hasJsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (hasJsonCreds) {
  console.log('✅ JSON credentials found (good for Vercel)');
} else if (hasKeyFile) {
  console.log('⚠️  Key file found (works locally, but you\'ll need JSON for Vercel)');
  console.log('   Convert your key file to JSON string for GOOGLE_APPLICATION_CREDENTIALS_JSON');
} else {
  console.log('❌ No Google Cloud credentials found');
  console.log('   Set either GOOGLE_CLOUD_KEY_FILE or GOOGLE_APPLICATION_CREDENTIALS_JSON');
}

console.log('\n📖 Next Steps:');
console.log('1. Set environment variables in Vercel dashboard or CLI');
console.log('2. Run: vercel --prod');
console.log('3. Test deployment: https://your-app.vercel.app/health');
console.log('\nFor detailed instructions, see DEPLOYMENT.md');