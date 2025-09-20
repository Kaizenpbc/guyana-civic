// Test script to verify PM Application setup
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'PM Application',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'PM Application is running!'
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'PM Application API is working!',
    endpoints: [
      'GET /health - Health check',
      'GET /api/test - Test endpoint',
      'POST /api/auth/login - User login',
      'GET /api/projects - List projects',
      'GET /api/schedules - List schedules',
      'GET /api/tasks - List tasks',
      'GET /api/templates - List templates'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PM Application test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
  console.log(`\n✅ PM Application is ready for integration!`);
  console.log(`\n📋 Next steps:`);
  console.log(`1. Set up MySQL database with schema.sql`);
  console.log(`2. Configure .env file with database credentials`);
  console.log(`3. Start full PM Application with: node server/index.js`);
  console.log(`4. Integrate with RDC Main App via API calls`);
});
