const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from client directory
app.use(express.static('client'));

// In-memory storage for testing (will be replaced with MySQL)
const mockData = {
  users: [
    { id: 'user-1', username: 'admin', email: 'admin@pm-app.com', role: 'admin' },
    { id: 'user-2', username: 'pm', email: 'pm@pm-app.com', role: 'project_manager' }
  ],
  projects: [
    { id: 'proj-1', name: 'Test Project', status: 'active', created_by: 'user-1' }
  ],
  schedules: {},
  tasks: {}
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'PM Application',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mode: 'test-without-database'
  });
});

// Serve PM Application main page
app.get('/', (req, res) => {
  res.sendFile('simple-pm.html', { root: __dirname + '/..' });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Simple test authentication
  if (username === 'admin' && password === 'admin') {
    const token = 'test-jwt-token-' + Date.now();
    res.json({
      message: 'Login successful',
      token,
      user: { id: 'user-1', username: 'admin', email: 'admin@pm-app.com', role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({ user: { id: 'user-1', username: 'admin', email: 'admin@pm-app.com', role: 'admin' } });
});

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json({ projects: mockData.projects });
});

app.get('/api/projects/:id', (req, res) => {
  const project = mockData.projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
});

// Schedules endpoints
app.get('/api/schedules/projects/:projectId/current', (req, res) => {
  const { projectId } = req.params;
  const schedule = mockData.schedules[projectId];
  
  if (!schedule) {
    return res.status(404).json({ error: 'No schedule found for this project' });
  }
  
  res.json({ schedule });
});

app.post('/api/schedules/projects/:projectId', (req, res) => {
  const { projectId } = req.params;
  const scheduleId = 'schedule-' + projectId + '-' + Date.now();
  
  mockData.schedules[projectId] = {
    id: scheduleId,
    project_id: projectId,
    name: 'Current Project Schedule',
    description: 'Active project schedule',
    status: 'draft',
    version: 1,
    is_current: true,
    created_at: new Date().toISOString()
  };
  
  res.status(201).json({
    message: 'Schedule created successfully',
    schedule: mockData.schedules[projectId]
  });
});

// Tasks endpoints
app.get('/api/tasks/schedules/:scheduleId', (req, res) => {
  const { scheduleId } = req.params;
  const tasks = mockData.tasks[scheduleId] || [];
  res.json({ tasks });
});

app.post('/api/tasks/schedules/:scheduleId/bulk', (req, res) => {
  const { scheduleId } = req.params;
  const { tasks } = req.body;
  
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Tasks must be an array' });
  }
  
  mockData.tasks[scheduleId] = tasks;
  
  res.json({ 
    message: 'Tasks saved successfully',
    count: tasks.length
  });
});

// Templates endpoints
app.get('/api/templates/schedules', (req, res) => {
  const templates = [
    {
      id: 'building-construction',
      name: 'Building Construction',
      description: 'Construct new buildings including community centers, offices, and public facilities',
      estimated_duration: '4-8 months',
      phases: [
        {
          id: 'initiation',
          name: 'Project Initiation',
          description: 'Initial project setup and stakeholder alignment',
          estimatedDays: 7,
          tasks: [
            { name: 'Stakeholder meeting', description: 'Meet with community leaders and officials' },
            { name: 'Site survey', description: 'Conduct detailed site survey and assessment' },
            { name: 'Budget confirmation', description: 'Confirm final budget and funding sources' }
          ]
        }
      ],
      documents: [
        { id: 'd1', name: 'Project Charter', description: 'Formal project authorization and scope definition' }
      ]
    }
  ];
  
  res.json({ templates });
});

app.get('/api/templates/checklists', (req, res) => {
  const templates = [
    {
      id: 'meeting-checklist',
      name: 'Meeting Checklist',
      task_type: 'meeting',
      checklist_items: [
        'Prepare agenda',
        'Send invitations',
        'Book meeting room',
        'Prepare materials'
      ]
    }
  ];
  
  res.json({ templates });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PM Application server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`\n🧪 Test Mode: Using in-memory storage (no MySQL required)`);
  console.log(`\n📋 Test Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin`);
  console.log(`\n🔗 Ready for RDC Main App integration!`);
});
