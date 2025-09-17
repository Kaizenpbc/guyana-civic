# Smart PM Assistant - Product Manual v1.0

## 📋 Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [System Overview](#system-overview)
3. [Core Features](#core-features)
4. [User Workflows](#user-workflows)
5. [Technical Specifications](#technical-specifications)
6. [API Documentation](#api-documentation)
7. [Phase 2 Roadmap](#phase-2-roadmap)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start Guide

### Getting Started (5 Minutes)

1. **Access the System**
   - Navigate to `http://localhost:5000`
   - Click "Login" in the top navigation

2. **Login Credentials**
   - **PM Role**: Username: `PM`, Password: `test`
   - **Staff Role**: Username: `Staff`, Password: `test`
   - **Admin Role**: Username: `Admin`, Password: `test`

3. **First Steps**
   - Login as PM to access the Project Manager Dashboard
   - View your assigned projects in the table
   - Click on any project to access its schedule and RAID management

### Key Navigation
- **PM Dashboard**: Main project overview and management
- **Project Schedule**: Click any project to access scheduling tools
- **RAID Management**: View/Add Risks, Issues, Decisions, Actions
- **Smart Templates**: Generate project schedules automatically

---

## 🏗️ System Overview

### Architecture
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL with comprehensive schema
- **UI Framework**: Shadcn/ui components
- **Authentication**: Session-based with role management

### User Roles
- **Citizen**: View public projects and submit requests
- **Staff**: Manage project intake and review
- **PM (Project Manager)**: Full project management capabilities
- **Admin**: System administration and user management
- **Super Admin**: Complete system control

### Project Workflow
```
Submitted → Under Review → Approved → Assigned → Initiate → Planning → In Progress → Completed
```

---

## ✨ Core Features

### 1. PM Dashboard
**Professional table-based project overview with comprehensive project management tools.**

#### Features:
- **Project Table**: Clean, professional display of all assigned projects
- **Status Tracking**: Real-time project status updates
- **Quick Actions**: Direct access to scheduling and RAID management
- **Progress Monitoring**: Visual progress indicators and metrics

#### Columns:
- Project Name & Description
- Base Start & Finish Dates
- Projected Finish & Budget
- Spend to Date & % Complete
- Status & Risk/Issue Links
- Action Buttons (View RAID, Add RAID, Schedule)

### 2. Smart Project Scheduling
**AI-powered project planning with intelligent templates and task management.**

#### Features:
- **Smart Templates**: Industry-specific project templates
- **Hierarchical Tasks**: Parent-child task relationships with MS Project-like behavior
- **Dependency Management**: Task dependencies with visual indicators
- **Date Management**: Interactive date selection and timeline management
- **Template Selection**: Choose from Building Construction, Road Construction, School Construction

#### Smart Templates Available:
- **Building Construction**: Complete construction project workflow
- **Road Construction**: Infrastructure development process
- **School Construction**: Educational facility development
- **Custom Templates**: Expandable template system

#### Task Management:
- **Expand/Collapse**: MS Project-like task hierarchy
- **Add/Remove Subtasks**: Dynamic task structure
- **Dependency Tracking**: Visual dependency indicators
- **Progress Tracking**: Task completion status

### 3. RAID Management System
**Comprehensive Risk, Issue, Decision, and Action management with professional UI.**

#### Features:
- **Professional Table Layout**: Clean, organized display of all RAID items
- **Interactive Hover Effects**: Visual feedback with smooth transitions
- **Clickable Details**: Each row opens detailed modal for full information
- **Smart Color Coding**: Risk scores, priorities, and statuses are color-coded
- **Responsive Design**: Works on all screen sizes

#### RAID Components:

##### Risks
- **Risk Categories**: Technical, Environmental, Financial, Operational, Legal
- **Risk Scoring**: Probability × Impact calculation (1-9 scale)
- **Status Tracking**: Identified, Assessed, Mitigated, Closed
- **Mitigation Strategies**: Detailed risk mitigation plans
- **Contingency Plans**: Backup plans for risk realization

##### Issues
- **Issue Categories**: Technical, Resource, Schedule, Quality, Communication
- **Priority Levels**: Low, Medium, High, Critical
- **Status Tracking**: Open, Investigating, Resolving, Resolved, Closed
- **Impact Assessment**: Detailed impact descriptions
- **Resolution Plans**: Step-by-step resolution strategies

##### Decisions
- **Decision Types**: Technical, Business, Resource, Process, Strategic
- **Decision Status**: Pending, Approved, Rejected, Deferred
- **Decision Maker**: Person responsible for the decision
- **Rationale**: Detailed reasoning behind decisions
- **Implementation**: Decision implementation tracking

##### Actions
- **Action Types**: Mitigation, Resolution, Implementation, Monitoring, Communication, Escalation
- **Status Tracking**: Pending, In Progress, Completed, Cancelled
- **Assignment**: Person responsible for action execution
- **Due Dates**: Action completion deadlines
- **Progress Notes**: Detailed progress tracking

### 4. PM Checklist System
**Contextual checklists that automatically suggest relevant items based on task type.**

#### Features:
- **Smart Suggestions**: Context-aware checklist items
- **Task-Specific Checklists**: Different checklists for different task types
- **Progress Tracking**: Visual completion indicators
- **Reminder System**: Important task reminders
- **Customizable**: Add/remove checklist items

#### Example Checklists:
- **Stakeholder Meeting**: "Test projector", "Send agenda 24h before"
- **Site Visit**: "Check weather", "Bring safety equipment"
- **Document Review**: "Verify signatures", "Check version control"

### 5. Professional UI/UX
**Modern, clean interface inspired by Linear and Notion with government-appropriate styling.**

#### Design Features:
- **Clean Typography**: Inter font with proper hierarchy
- **Consistent Spacing**: Tailwind-based spacing system
- **Color Coding**: Status-based color schemes
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

#### UI Components:
- **Tables**: Professional data display with hover effects
- **Modals**: Detailed information display
- **Forms**: Clean, validated input forms
- **Buttons**: Consistent action buttons
- **Badges**: Status and priority indicators

---

## 🔄 User Workflows

### Project Manager Workflow

#### 1. Daily Project Review
1. **Login** to PM Dashboard
2. **Review Project Table** for status updates
3. **Check RAID Items** for any new risks/issues
4. **Update Project Schedules** as needed
5. **Review PM Checklists** for pending items

#### 2. New Project Assignment
1. **Receive Project** with "initiate" status
2. **Access Project** from dashboard
3. **Generate Smart Template** based on project type
4. **Customize Schedule** with specific dates and tasks
5. **Add Subtasks** as needed
6. **Save Schedule** for future reference

#### 3. Risk Management
1. **Identify Risk** through project review
2. **Click "Add RAID"** on project table
3. **Select "Risk" tab** in RAID management
4. **Fill Risk Form** with details
5. **Set Risk Score** (Probability × Impact)
6. **Assign Owner** and due date
7. **Save Risk** for tracking

#### 4. Issue Resolution
1. **Identify Issue** during project execution
2. **Click "Add RAID"** on project table
3. **Select "Issue" tab** in RAID management
4. **Fill Issue Form** with details
5. **Set Priority** and assign owner
6. **Create Resolution Plan**
7. **Track Progress** until resolved

### Staff Workflow

#### 1. Project Intake
1. **Review Submitted Projects**
2. **Assess Project Feasibility**
3. **Assign to Appropriate PM**
4. **Update Project Status**

#### 2. Project Oversight
1. **Monitor Project Progress**
2. **Review RAID Items**
3. **Provide Guidance** to PMs
4. **Escalate Issues** as needed

---

## 🔧 Technical Specifications

### System Requirements
- **Node.js**: v18+ (recommended v22+)
- **MySQL**: v8.0+
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Memory**: 4GB+ RAM recommended
- **Storage**: 1GB+ available space

### Development Environment
- **Frontend**: Vite + React + TypeScript
- **Backend**: Express + TypeScript
- **Database**: MySQL with comprehensive schema
- **Package Manager**: npm
- **Development Server**: Hot reload enabled

### Database Schema
- **Users**: Authentication and role management
- **Projects**: Project information and status
- **Project Schedules**: Schedule data and templates
- **Schedule Tasks**: Individual task management
- **RAID Tables**: Risks, Issues, Decisions, Actions
- **PM Checklists**: Contextual checklist system

### API Endpoints
- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Schedules**: `/api/schedules/*`
- **RAID Management**: `/api/projects/:id/risks|issues|decisions|actions`
- **PM Tools**: `/api/pm-tool/*`

---

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
**Login user and establish session**
```json
{
  "username": "PM",
  "password": "test"
}
```

#### GET /api/auth/me
**Get current user information**
```json
{
  "user": {
    "id": "user-6",
    "username": "PM",
    "email": "pm@example.com",
    "role": "pm"
  }
}
```

### Project Management Endpoints

#### GET /api/projects
**Get all projects for current user**
```json
{
  "projects": [
    {
      "id": "proj-pm-1",
      "name": "Essequibo Coast School Renovation",
      "description": "Complete renovation of school facilities",
      "status": "in_progress",
      "base_start": "2025-01-15",
      "base_finish": "2025-06-30"
    }
  ]
}
```

#### GET /api/projects/:id/schedules/current
**Get current schedule for project**
```json
{
  "schedule": {
    "id": "schedule-1",
    "project_id": "proj-pm-1",
    "template_type": "building_construction",
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

### RAID Management Endpoints

#### POST /api/projects/:id/risks
**Create new risk**
```json
{
  "title": "Weather Delays",
  "description": "Potential delays due to rainy season",
  "category": "environmental",
  "probability": "high",
  "impact": "medium",
  "mitigation_strategy": "Schedule buffer time",
  "contingency_plan": "Extend project timeline",
  "owner_id": "user-6",
  "due_date": "2025-10-01"
}
```

#### GET /api/projects/:id/risks
**Get all risks for project**
```json
{
  "risks": [
    {
      "id": "risk-1",
      "title": "Weather Delays",
      "risk_score": 6,
      "status": "identified",
      "owner_id": "user-6"
    }
  ]
}
```

---

## 🚀 Phase 2 Roadmap

### Phase 2A: Smart Suggestions (Weeks 1-2)
- **AI-powered risk suggestions** based on project type
- **Smart form auto-complete** with contextual suggestions
- **Basic notification system** for important updates
- **Risk pattern recognition** from similar projects

### Phase 2B: Intelligent Automation (Weeks 3-4)
- **Automated escalation workflows** for critical issues
- **Smart assignment algorithms** based on expertise
- **Advanced notification system** with priority levels
- **Issue correlation detection** for related problems

### Phase 2C: Analytics & Insights (Weeks 5-6)
- **Project health dashboard** with real-time metrics
- **Predictive analytics** for risk forecasting
- **Performance metrics** and trend analysis
- **Success probability scoring** for projects

### Smart Features Preview
- **Smart PM Assistant**: Contextual guidance and suggestions
- **Intelligent Notifications**: Right person, right time alerts
- **Predictive Insights**: Risk probability forecasting
- **Automated Workflows**: Smart routing and escalation

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Login Problems
**Issue**: Cannot login or getting authentication errors
**Solution**: 
- Ensure server is running (`npm run dev`)
- Check credentials (PM/test, Staff/test, Admin/test)
- Clear browser cookies and try again

#### 2. Project Not Loading
**Issue**: Project schedule not appearing
**Solution**:
- Refresh the page
- Check if project has "initiate" status
- Generate new template if needed

#### 3. RAID Items Not Saving
**Issue**: Risk/Issue/Decision/Action not saving
**Solution**:
- Check all required fields are filled
- Ensure you're logged in
- Try refreshing and submitting again

#### 4. Server Connection Issues
**Issue**: "Connection refused" or API errors
**Solution**:
- Restart development server (`npm run dev`)
- Check if port 5000 is available
- Kill existing Node processes if needed

### Performance Tips
- **Clear browser cache** regularly
- **Restart server** if experiencing slowdowns
- **Check database connections** if data not loading
- **Monitor console** for error messages

### Getting Help
- **Check browser console** for error messages
- **Review server logs** for backend issues
- **Verify database connection** if data issues persist
- **Test with different browsers** if UI problems occur

---

## 📊 System Status

### Current Version: v1.0
- **Phase 1 Complete**: Foundation features implemented
- **Database**: Fully configured with comprehensive schema
- **Authentication**: Role-based access control working
- **RAID Management**: Professional table-based interface
- **Project Scheduling**: Smart templates and task management
- **PM Checklists**: Contextual reminder system

### Next Release: v2.0 (Phase 2)
- **Smart Features**: AI-powered suggestions and automation
- **Advanced Analytics**: Project health and predictive insights
- **Enhanced Workflows**: Intelligent routing and escalation
- **Performance Improvements**: Optimized for larger datasets

---

*Last Updated: January 2025*
*Document Version: 1.0*
*System Version: Phase 1 Complete*
