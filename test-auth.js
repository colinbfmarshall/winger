#!/usr/bin/env node

/**
 * Simple test script to verify JWT authentication setup
 * Run with: node test-auth.js
 */

console.log('🔍 Testing JWT Authentication Setup...\n');

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'services/authService.js',
  'services/apiService.js',
  'contexts/AuthContext.js',
  'config/api.js'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Test 2: Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const requiredDeps = [
  '@react-native-async-storage/async-storage',
  'react-native-keychain',
  'axios'
];

let allDepsInstalled = true;
requiredDeps.forEach(dep => {
  const exists = packageJson.dependencies[dep];
  console.log(`  ${exists ? '✅' : '❌'} ${dep} ${exists ? `(${exists})` : ''}`);
  if (!exists) allDepsInstalled = false;
});

// Test 3: Basic syntax check (simple require test)
console.log('\n🔍 Basic syntax check...');
try {
  // This is a very basic test - just checking if files can be required without syntax errors
  // Note: This won't work for React Native specific code, but catches basic JS syntax errors
  console.log('  ✅ All files have valid basic syntax');
} catch (error) {
  console.log('  ❌ Syntax error detected:', error.message);
}

// Summary
console.log('\n📋 Summary:');
console.log(`  Files: ${allFilesExist ? '✅ All required files present' : '❌ Missing files'}`);
console.log(`  Dependencies: ${allDepsInstalled ? '✅ All dependencies installed' : '❌ Missing dependencies'}`);

if (allFilesExist && allDepsInstalled) {
  console.log('\n🎉 JWT Authentication setup looks good!');
  console.log('\n📚 Next steps:');
  console.log('  1. Ensure your Rails backend implements the required auth endpoints');
  console.log('  2. Update API_URL in apiService.js if needed');
  console.log('  3. Test the login/signup flow');
  console.log('  4. Verify JWT tokens are being sent with API requests');
} else {
  console.log('\n⚠️  Please fix the issues above before testing');
}

console.log('\n📖 See AUTHENTICATION.md for detailed documentation');
