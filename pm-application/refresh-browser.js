// Simple script to refresh browser when server restarts
const { exec } = require('child_process');

console.log('🔄 Server restarted - attempting to refresh browser...');

// Try to open the refresh page in the default browser
exec('start http://localhost:3001/refresh', (error, stdout, stderr) => {
  if (error) {
    console.log('⚠️  Could not auto-refresh browser. Please manually refresh the page.');
    console.log('   Go to: http://localhost:3001/refresh');
  } else {
    console.log('✅ Browser refresh initiated');
  }
});
