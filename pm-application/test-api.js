// Test PM Application API
const http = require('http');

console.log('🧪 Testing PM Application API...\n');

// Test 1: Health Check
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Health Check:', result.status);
          resolve(result);
        } catch (error) {
          console.log('❌ Health Check failed:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Health Check failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Health Check timeout');
      reject(new Error('Timeout'));
    });
  });
}

// Test 2: Projects API
function testProjects() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/api/projects', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Projects API:', result.projects.length, 'projects found');
          resolve(result);
        } catch (error) {
          console.log('❌ Projects API failed:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Projects API failed:', error.message);
      reject(error);
    });
  });
}

// Test 3: Templates API
function testTemplates() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/api/templates/schedules', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Templates API:', result.templates.length, 'templates found');
          resolve(result);
        } catch (error) {
          console.log('❌ Templates API failed:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Templates API failed:', error.message);
      reject(error);
    });
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting PM Application API Tests...\n');
  
  try {
    await testHealth();
    await testProjects();
    await testTemplates();
    
    console.log('\n🎉 All PM Application API tests passed!');
    console.log('\n📋 PM Application is ready for RDC Main App integration:');
    console.log('   • Health Check: http://localhost:3001/health');
    console.log('   • Projects API: http://localhost:3001/api/projects');
    console.log('   • Templates API: http://localhost:3001/api/templates/schedules');
    console.log('\n🔗 RDC Main App can now make API calls to PM Application!');
    
  } catch (error) {
    console.log('\n❌ PM Application API tests failed');
    console.log('💡 Make sure PM Application is running: node server/index-simple.js');
  }
}

runTests();
