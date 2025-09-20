// Quick test for PM Application
console.log('🚀 PM Application Quick Test');
console.log('============================');

// Test 1: Check if all required modules are available
console.log('\n1. Testing module availability...');
try {
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const mysql = require('mysql2/promise');
  console.log('✅ All required modules are available');
} catch (error) {
  console.log('❌ Missing modules:', error.message);
}

// Test 2: Check file structure
console.log('\n2. Testing file structure...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'server/index.js',
  'server/database/connection.js',
  'server/routes/auth.js',
  'server/routes/projects.js',
  'server/routes/schedules.js',
  'server/routes/tasks.js',
  'server/routes/templates.js',
  'database/schema.sql',
  'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All required files are present');
} else {
  console.log('\n❌ Some files are missing');
}

// Test 3: Check package.json
console.log('\n3. Testing package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Package name: ${packageJson.name}`);
  console.log(`✅ Version: ${packageJson.version}`);
  console.log(`✅ Dependencies: ${Object.keys(packageJson.dependencies).length} packages`);
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

console.log('\n🎉 PM Application Setup Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Set up MySQL database: mysql -u root -p < database/schema.sql');
console.log('2. Configure environment: cp env.example .env');
console.log('3. Start PM Application: node server/index.js');
console.log('4. Test API: curl http://localhost:3001/health');
console.log('\n🔗 PM Application will run on port 3001');
console.log('🔗 RDC Main App can integrate via API calls');
