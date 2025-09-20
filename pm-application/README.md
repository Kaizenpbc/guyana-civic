# PM Application

A standalone Project Management Application with MySQL database, designed to be sold as a separate product.

## Features

- ✅ **User Authentication** - JWT-based authentication
- ✅ **Project Management** - Create, update, delete projects
- ✅ **Schedule Management** - Project schedules with phases
- ✅ **Task Management** - Hierarchical task structure
- ✅ **Template System** - Reusable project templates
- ✅ **MySQL Database** - Persistent data storage
- ✅ **REST API** - Clean API for external integration
- ✅ **Standalone** - Can be deployed independently

## Architecture

```
RDC Main App ──API──> PM Application (Standalone)
     │                    │
     │                    │
   Port 5000          Port 3001
   (Main App)         (PM Service)
     │                    │
     │                    │
   MySQL DB           MySQL DB
   (RDC Data)         (PM Data)
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p < database/schema.sql
```

### 3. Environment Configuration
```bash
cp env.example .env
# Edit .env with your database credentials
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. API Endpoints
- **Health Check**: `GET http://localhost:3001/health`
- **API Base**: `http://localhost:3001/api`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Schedules
- `GET /api/schedules/projects/:projectId/current` - Get current schedule
- `POST /api/schedules/projects/:projectId` - Create schedule
- `PUT /api/schedules/:scheduleId` - Update schedule
- `DELETE /api/schedules/:scheduleId` - Delete schedule

### Tasks
- `GET /api/tasks/schedules/:scheduleId` - Get tasks for schedule
- `POST /api/tasks/schedules/:scheduleId/bulk` - Save bulk tasks
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task

### Templates
- `GET /api/templates/schedules` - Get schedule templates
- `GET /api/templates/checklists` - Get checklist templates
- `POST /api/templates/schedules` - Create schedule template
- `POST /api/templates/checklists` - Create checklist template

## Database Schema

The application uses MySQL with the following main tables:
- `users` - User authentication and roles
- `projects` - Project information
- `schedules` - Project schedules
- `tasks` - Individual tasks within schedules
- `schedule_templates` - Reusable project templates
- `pm_checklist_templates` - PM checklist templates

## Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
DB_HOST=your-mysql-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=pm_application
JWT_SECRET=your-secure-jwt-secret
ALLOWED_ORIGINS=https://your-rdc-app.com
```

### Docker Deployment
```bash
# Build Docker image
docker build -t pm-application .

# Run with MySQL
docker-compose up -d
```

## Integration with RDC Main App

The PM Application is designed to be called by the RDC Main App via API:

```javascript
// Example API call from RDC Main App
const response = await fetch('http://localhost:3001/api/projects', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## License

MIT License - Can be sold as a standalone product.
