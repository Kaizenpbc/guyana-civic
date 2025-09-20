-- PM Application Database Schema
-- Standalone Project Management Application

CREATE DATABASE IF NOT EXISTS pm_application;
USE pm_application;

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'project_manager', 'team_member', 'viewer') NOT NULL DEFAULT 'team_member',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PROJECTS
-- =============================================

CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    budget_allocated DECIMAL(15, 2),
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    start_date DATE,
    end_date DATE,
    project_manager_id VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_manager_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- SCHEDULES
-- =============================================

CREATE TABLE schedules (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id VARCHAR(50),
    template_name VARCHAR(255),
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    total_duration_days INT DEFAULT 0,
    total_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- TASKS
-- =============================================

CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    schedule_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type ENUM('phase', 'subtask', 'document', 'milestone') NOT NULL,
    parent_task_id VARCHAR(36) NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'not_started',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    estimated_hours DECIMAL(8, 2) DEFAULT 0,
    actual_hours DECIMAL(8, 2) DEFAULT 0,
    assigned_to VARCHAR(36) NULL,
    dependencies JSON,
    subtasks JSON,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- TEMPLATES
-- =============================================

CREATE TABLE schedule_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    estimated_duration VARCHAR(50),
    phases JSON NOT NULL,
    documents JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- CHECKLISTS
-- =============================================

CREATE TABLE pm_checklist_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(100),
    checklist_items JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(project_manager_id);
CREATE INDEX idx_schedules_project ON schedules(project_id);
CREATE INDEX idx_schedules_current ON schedules(is_current);
CREATE INDEX idx_tasks_schedule ON tasks(schedule_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
