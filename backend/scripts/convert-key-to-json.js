#!/usr/bin/env node

/**
 * Convert Google Cloud Service Account Key File to JSON String
 * 
 * This script helps convert your service account key file to a JSON string
 * that can be used as an environment variable in Vercel.
 */

const fs = require('fs');
const path = require('path');

const keyFilePath = process.argv[2] || './config/service-account-key.json';

if (!fs.existsSync(keyFilePath)) {
  console.error(`❌ Key file not found: ${keyFilePath}`);
  console.log('Usage: node scripts/convert-key-to-json.js [path-to-key-file]');
  console.log('Example: node scripts/convert-key-to-json.js ./config/service-account-key.json');
  process.exit(1);
}

try {
  const keyContent = fs.readFileSync(keyFilePath, 'utf8');
  const keyData = JSON.parse(keyContent);
  
  // Validate it's a service account key
  if (!keyData.type || keyData.type !== 'service_account') {
    console.error('❌ This doesn\'t appear to be a valid service account key file');
    process.exit(1);
  }
  
  // Minify the JSON (remove unnecessary whitespace)
  const minifiedJson = JSON.stringify(keyData);
  
  console.log('✅ Service Account Key Converted Successfully!\n');
  console.log('📋 Copy this JSON string and set it as GOOGLE_APPLICATION_CREDENTIALS_JSON in Vercel:\n');
  console.log('─'.repeat(80));
  console.log(minifiedJson);
  console.log('─'.repeat(80));
  console.log('\n🔧 In Vercel Dashboard:');
  console.log('1. Go to your project settings');
  console.log('2. Navigate to Environment Variables');
  console.log('3. Add: GOOGLE_APPLICATION_CREDENTIALS_JSON');
  console.log('4. Paste the JSON string above as the value');
  console.log('\n🔧 Or via Vercel CLI:');
  console.log('vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON');
  console.log('(then paste the JSON string when prompted)');
  
} catch (error) {
  console.error('❌ Error reading or parsing key file:', error.message);
  process.exit(1);
}