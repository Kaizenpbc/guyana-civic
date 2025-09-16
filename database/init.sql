-- Guyana Civic Database Schema
-- Modular design for Citizen Engagement, HR, Project Management, etc.

USE guyana_civic;

-- =============================================
-- USER MANAGEMENT MODULE
-- =============================================

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'employee', 'admin', 'super_admin') NOT NULL DEFAULT 'citizen',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    region_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- CITIZEN ENGAGEMENT MODULE
-- =============================================

CREATE TABLE jurisdictions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE issues (
    id VARCHAR(36) PRIMARY KEY,
    jurisdiction_id VARCHAR(50) NOT NULL,
    citizen_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('road', 'water', 'electricity', 'health', 'education', 'other') DEFAULT 'other',
    status ENUM('submitted', 'acknowledged', 'in_progress', 'resolved', 'closed') DEFAULT 'submitted',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id),
    FOREIGN KEY (citizen_id) REFERENCES users(id)
);

CREATE TABLE announcements (
    id VARCHAR(36) PRIMARY KEY,
    jurisdiction_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

-- =============================================
-- HR & TIME MANAGEMENT MODULE
-- =============================================

CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    jurisdiction_id VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id)
);

CREATE TABLE timesheets (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    week_start_date DATE NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
    total_hours DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE timesheet_entries (
    id VARCHAR(36) PRIMARY KEY,
    timesheet_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    hours_worked DECIMAL(4, 2) NOT NULL,
    project_id VARCHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (timesheet_id) REFERENCES timesheets(id) ON DELETE CASCADE
);

CREATE TABLE leave_requests (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    leave_type ENUM('vacation', 'sick', 'personal', 'bereavement', 'maternity', 'paternity') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
    approved_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approved_by) REFERENCES employees(id)
);

-- =============================================
-- PROJECT MANAGEMENT MODULE (Enhanced)
-- =============================================

CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    jurisdiction_id VARCHAR(50) NOT NULL, -- Primary jurisdiction (for backward compatibility)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('infrastructure', 'health', 'education', 'agriculture', 'environment', 'social', 'economic') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    
    -- Project Scope & Funding
    scope ENUM('local', 'regional', 'national') DEFAULT 'local',
    funding_source ENUM('local', 'regional', 'national', 'international') DEFAULT 'local',
    
    -- Budget Management
    budget_allocated DECIMAL(15, 2) NOT NULL,
    budget_spent DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'GYD',
    
    -- Timeline
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    
    -- Status & Progress
    status ENUM('planning', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Team Management
    project_manager_id VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    
    -- Public Engagement
    is_public BOOLEAN DEFAULT TRUE,
    public_description TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id),
    FOREIGN KEY (project_manager_id) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Cross-RDC Project Jurisdictions
CREATE TABLE project_jurisdictions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    jurisdiction_id VARCHAR(50) NOT NULL,
    relationship_type ENUM('primary', 'secondary', 'affected') DEFAULT 'primary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id),
    UNIQUE KEY unique_project_jurisdiction (project_id, jurisdiction_id)
);

CREATE TABLE project_milestones (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_date DATE,
    status ENUM('pending', 'in_progress', 'completed', 'overdue') DEFAULT 'pending',
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_team_members (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    employee_id VARCHAR(36) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'manager', 'coordinator', 'supervisor', 'worker'
    assigned_date DATE DEFAULT (CURRENT_DATE),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_active_assignment (project_id, employee_id, is_active)
);

CREATE TABLE project_contractors (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    contract_amount DECIMAL(15, 2),
    contract_start_date DATE,
    contract_end_date DATE,
    status ENUM('pending', 'active', 'completed', 'terminated') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_budget_categories (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE project_citizen_updates (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    update_type ENUM('progress', 'milestone', 'delay', 'completion', 'general') DEFAULT 'general',
    is_public BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE project_feedback (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    citizen_id VARCHAR(36),
    feedback_type ENUM('complaint', 'suggestion', 'praise', 'question') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('new', 'acknowledged', 'in_review', 'resolved', 'closed') DEFAULT 'new',
    response TEXT,
    responded_by VARCHAR(36),
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (citizen_id) REFERENCES users(id),
    FOREIGN KEY (responded_by) REFERENCES users(id)
);

CREATE TABLE project_documents (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type ENUM('contract', 'permit', 'report', 'photo', 'other') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    uploaded_by VARCHAR(36) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Project Issues (can be linked to citizen issues)
CREATE TABLE project_issues (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    issue_id VARCHAR(36), -- Links to main issues table
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES issues(id),
    FOREIGN KEY (assigned_to) REFERENCES employees(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- PROFESSIONAL PM TOOL MODULE (Enterprise Level)
-- =============================================

-- Projects table (enhanced with schedule management)
ALTER TABLE projects 
ADD COLUMN has_schedule BOOLEAN DEFAULT false,
ADD COLUMN schedule_created_at TIMESTAMP NULL,
ADD COLUMN schedule_updated_at TIMESTAMP NULL,
ADD COLUMN schedule_version INT DEFAULT 1,
ADD COLUMN assigned_to VARCHAR(50),
ADD COLUMN assigned_at TIMESTAMP;

-- Update projects table to include new status values
ALTER TABLE projects 
MODIFY COLUMN status ENUM('submitted', 'under_review', 'approved', 'assigned', 'initiate', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'submitted';

-- Project schedules (main schedule container)
CREATE TABLE project_schedules (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id VARCHAR(100), -- References our smart templates
    template_name VARCHAR(255), -- Building Construction, Road Construction, etc.
    selected_phases JSON, -- Store selected phases from template
    selected_documents JSON, -- Store selected documents from template
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true, -- Only one current version per project
    
    -- Schedule metadata
    total_duration_days INT,
    total_tasks INT,
    completed_tasks INT DEFAULT 0,
    progress_percentage INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL,
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project (project_id),
    INDEX idx_template (template_id),
    INDEX idx_status (status),
    INDEX idx_current (is_current)
);

-- Schedule phases (Project Initiation, Design & Planning, etc.)
CREATE TABLE schedule_phases (
    id VARCHAR(50) PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL,
    phase_order INT NOT NULL, -- 1, 2, 3, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_days INT NOT NULL,
    actual_days INT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('not_started', 'in_progress', 'completed', 'on_hold') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    
    -- Dependencies
    depends_on_phases JSON, -- Array of phase IDs this phase depends on
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES project_schedules(id) ON DELETE CASCADE,
    INDEX idx_schedule (schedule_id),
    INDEX idx_order (phase_order),
    INDEX idx_status (status)
);

-- Schedule tasks (main tasks and subtasks)
CREATE TABLE schedule_tasks (
    id VARCHAR(50) PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL,
    phase_id VARCHAR(50) NOT NULL,
    parent_task_id VARCHAR(50) NULL, -- NULL for main tasks, references another task for subtasks
    
    -- Task hierarchy
    task_order INT NOT NULL, -- Order within phase
    level INT DEFAULT 1, -- 1 for main tasks, 2+ for subtasks
    is_subtask BOOLEAN DEFAULT false,
    
    -- Task details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_hours INT NOT NULL,
    actual_hours INT NULL,
    
    -- Dates
    planned_start_date DATE NULL,
    planned_end_date DATE NULL,
    actual_start_date DATE NULL,
    actual_end_date DATE NULL,
    
    -- Dependencies
    depends_on_tasks JSON, -- Array of task IDs this task depends on
    
    -- Resources and status
    assigned_to VARCHAR(50) NULL,
    required_skills JSON, -- Array of required skills
    deliverables JSON, -- Array of deliverables
    status ENUM('not_started', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'not_started',
    progress_percentage INT DEFAULT 0,
    
    -- PM Checklist data
    checklist_items JSON, -- Store PM checklist items and completion status
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES project_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (phase_id) REFERENCES schedule_phases(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_task_id) REFERENCES schedule_tasks(id) ON DELETE CASCADE,
    
    INDEX idx_schedule (schedule_id),
    INDEX idx_phase (phase_id),
    INDEX idx_parent (parent_task_id),
    INDEX idx_order (task_order),
    INDEX idx_status (status)
);

-- Schedule templates (our smart templates)
CREATE TABLE schedule_templates (
    id VARCHAR(100) PRIMARY KEY, -- building-construction, road-construction, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- infrastructure, education, environment
    estimated_duration VARCHAR(100), -- "4-8 months"
    icon VARCHAR(100), -- lucide icon name
    
    -- Template configuration
    phases JSON NOT NULL, -- Array of phase definitions
    documents JSON NOT NULL, -- Array of required documents
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Schedule change history for audit trails
CREATE TABLE schedule_history (
    id VARCHAR(50) PRIMARY KEY,
    schedule_id VARCHAR(50) NOT NULL,
    action ENUM('created', 'updated', 'phase_added', 'phase_updated', 'task_added', 'task_updated', 'task_completed', 'deleted') NOT NULL,
    entity_type ENUM('schedule', 'phase', 'task') NOT NULL,
    entity_id VARCHAR(50) NULL,
    
    -- Change details
    old_values JSON NULL, -- Previous values
    new_values JSON NULL, -- New values
    change_summary TEXT,
    
    -- User and timestamp
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (schedule_id) REFERENCES project_schedules(id) ON DELETE CASCADE,
    INDEX idx_schedule (schedule_id),
    INDEX idx_action (action),
    INDEX idx_changed_by (changed_by),
    INDEX idx_changed_at (changed_at)
);

-- PM checklist templates (our smart contextual reminders)
CREATE TABLE pm_checklist_templates (
    id VARCHAR(50) PRIMARY KEY,
    task_type VARCHAR(100) NOT NULL, -- meeting, survey, budget, design, etc.
    task_keywords JSON, -- Array of keywords to match task names
    
    -- Checklist items
    checklist_items JSON NOT NULL, -- Array of checklist items with priorities
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_task_type (task_type),
    INDEX idx_active (is_active)
);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert jurisdictions (RDCs)
INSERT INTO jurisdictions (id, name, description, contact_email, contact_phone, address) VALUES
('region-1', 'Barima-Waini (Region 1)', 'Northernmost region managing Mabaruma and surrounding areas, focusing on agriculture, mining, and border services.', 'info@region1.gov.gy', '+592 777-1234', 'Regional Democratic Council, Mabaruma, Region 1'),
('region-2', 'Pomeroon-Supenaam (Region 2)', 'Coastal region managing Anna Regina and surrounding areas, specializing in rice farming and coastal development.', 'info@region2.gov.gy', '+592 777-1235', 'Regional Democratic Council, Anna Regina, Region 2'),
('region-3', 'Essequibo Islands-West Demerara (Region 3)', 'Strategic region managing Vreed-en-Hoop and Essequibo Islands, focusing on transportation and industrial development.', 'info@region3.gov.gy', '+592 777-1236', 'Regional Democratic Council, Vreed-en-Hoop, Region 3'),
('region-4', 'Demerara-Mahaica (Region 4)', 'Capital region managing Georgetown and surrounding areas, providing central government services and urban development.', 'info@region4.gov.gy', '+592 777-1237', 'Regional Democratic Council, Georgetown, Region 4'),
('region-5', 'Mahaica-Berbice (Region 5)', 'Agricultural region managing Fort Wellington and surrounding areas, specializing in sugar production and rural development.', 'info@region5.gov.gy', '+592 777-1238', 'Regional Democratic Council, Fort Wellington, Region 5'),
('region-6', 'East Berbice-Corentyne (Region 6)', 'Eastern region managing New Amsterdam and surrounding areas, focusing on agriculture, education, and border services.', 'info@region6.gov.gy', '+592 777-1239', 'Regional Democratic Council, New Amsterdam, Region 6'),
('region-7', 'Cuyuni-Mazaruni (Region 7)', 'Mining region managing Bartica and surrounding areas, specializing in gold mining, forestry, and eco-tourism.', 'info@region7.gov.gy', '+592 777-1240', 'Regional Democratic Council, Bartica, Region 7'),
('region-8', 'Potaro-Siparuni (Region 8)', 'Interior region managing Mahdia and surrounding areas, focusing on mining, forestry, and indigenous community development.', 'info@region8.gov.gy', '+592 777-1241', 'Regional Democratic Council, Mahdia, Region 8'),
('region-9', 'Upper Takutu-Upper Essequibo (Region 9)', 'Southern region managing Lethem and surrounding areas, specializing in ranching, agriculture, and border trade.', 'info@region9.gov.gy', '+592 777-1242', 'Regional Democratic Council, Lethem, Region 9'),
('region-10', 'Upper Demerara-Berbice (Region 10)', 'Industrial region managing Linden and surrounding areas, focusing on bauxite mining, manufacturing, and urban development.', 'info@region10.gov.gy', '+592 777-1243', 'Regional Democratic Council, Linden, Region 10');

-- Insert sample admin user
INSERT INTO users (id, username, email, password_hash, role) VALUES
('admin-1', 'admin', 'admin@guyana-civic.gov.gy', '$2b$10$example_hash', 'super_admin');

-- Insert sample projects
INSERT INTO projects (id, jurisdiction_id, name, description, category, priority, scope, funding_source, budget_allocated, budget_spent, planned_start_date, planned_end_date, actual_start_date, status, progress_percentage, created_by) VALUES
('proj-1', 'region-1', 'Mabaruma Road Repairs', 'Repair and upgrade main roads in Mabaruma area to improve transportation and connectivity for local communities.', 'infrastructure', 'high', 'local', 'local', 2500000.00, 1625000.00, '2024-01-01', '2024-06-30', '2024-01-15', 'in_progress', 65, 'admin-1'),
('proj-2', 'region-2', 'Anna Regina Water System', 'Install new water treatment system for Anna Regina to provide clean drinking water to 15,000 residents.', 'infrastructure', 'urgent', 'local', 'local', 1800000.00, 720000.00, '2024-02-01', '2024-08-31', '2024-02-10', 'in_progress', 40, 'admin-1'),
('proj-3', 'region-1', 'Agricultural Training Program', 'Comprehensive training program for local farmers on modern farming techniques and sustainable agriculture practices.', 'agriculture', 'medium', 'local', 'local', 500000.00, 0.00, '2024-03-01', '2024-12-31', NULL, 'planning', 0, 'admin-1'),
('proj-4', 'region-2', 'Community Health Clinic', 'Construction of new health clinic to serve rural communities in Region 2 with modern medical facilities.', 'health', 'high', 'local', 'local', 3200000.00, 0.00, '2024-04-01', '2025-03-31', NULL, 'approved', 0, 'admin-1'),
('proj-5', 'region-1', 'Drainage System Upgrade', 'Upgrade drainage systems in Mabaruma to prevent flooding during rainy season and protect agricultural lands.', 'infrastructure', 'medium', 'local', 'local', 1200000.00, 540000.00, '2024-01-15', '2024-05-15', '2024-01-20', 'in_progress', 45, 'admin-1'),
('proj-6', 'region-1', 'Georgetown-Linden Highway', 'Major highway construction connecting Georgetown (Region 4) to Linden (Region 10) with improved road conditions and safety features.', 'infrastructure', 'urgent', 'national', 'national', 15000000.00, 4500000.00, '2024-01-01', '2025-12-31', '2024-01-15', 'in_progress', 30, 'admin-1'),
('proj-7', 'region-2', 'Coastal Protection System', 'Comprehensive coastal protection and sea defense system covering Regions 2, 3, and 4 to protect against rising sea levels.', 'infrastructure', 'high', 'regional', 'national', 25000000.00, 7500000.00, '2024-02-01', '2026-06-30', '2024-02-15', 'in_progress', 25, 'admin-1'),
('proj-8', 'region-1', 'Cross-Border Trade Facility', 'Modern trade and customs facility at the Venezuela border serving both Region 1 and Region 7 for improved international trade.', 'economic', 'medium', 'regional', 'national', 8000000.00, 1600000.00, '2024-03-01', '2025-08-31', '2024-03-10', 'in_progress', 20, 'admin-1');

-- Insert sample project milestones
INSERT INTO project_milestones (id, project_id, name, description, due_date, status, progress_percentage) VALUES
('milestone-1', 'proj-1', 'Site Survey Complete', 'Complete topographical survey and environmental assessment', '2024-01-31', 'completed', 100),
('milestone-2', 'proj-1', 'Contractor Selection', 'Select and contract construction company', '2024-02-15', 'completed', 100),
('milestone-3', 'proj-1', 'Phase 1 Construction', 'Complete first 2km of road repairs', '2024-04-30', 'in_progress', 80),
('milestone-4', 'proj-1', 'Phase 2 Construction', 'Complete remaining road sections', '2024-06-15', 'pending', 0),
('milestone-5', 'proj-1', 'Final Inspection', 'Quality inspection and project handover', '2024-06-30', 'pending', 0),
('milestone-6', 'proj-2', 'Design Phase', 'Complete engineering design and permits', '2024-03-15', 'completed', 100),
('milestone-7', 'proj-2', 'Equipment Procurement', 'Purchase and install water treatment equipment', '2024-05-31', 'in_progress', 60),
('milestone-8', 'proj-2', 'System Testing', 'Test and commission water treatment system', '2024-07-31', 'pending', 0);

-- Insert sample project team members
INSERT INTO project_team_members (id, project_id, employee_id, role) VALUES
('team-1', 'proj-1', 'emp-1', 'manager'),
('team-2', 'proj-1', 'emp-2', 'supervisor'),
('team-3', 'proj-2', 'emp-3', 'manager'),
('team-4', 'proj-2', 'emp-4', 'coordinator');

-- Insert sample project contractors
INSERT INTO project_contractors (id, project_id, name, contact_person, contact_phone, contact_email, contract_amount, contract_start_date, contract_end_date, status) VALUES
('contractor-1', 'proj-1', 'Guyana Construction Ltd', 'John Smith', '+592 600-1234', 'john@guyanaconstruction.gy', 2200000.00, '2024-02-01', '2024-06-30', 'active'),
('contractor-2', 'proj-2', 'AquaTech Solutions', 'Maria Rodriguez', '+592 600-5678', 'maria@aquatech.gy', 1600000.00, '2024-03-01', '2024-08-31', 'active');

-- Insert sample project budget categories
INSERT INTO project_budget_categories (id, project_id, category_name, allocated_amount, spent_amount, description) VALUES
('budget-1', 'proj-1', 'Materials', 1500000.00, 975000.00, 'Concrete, asphalt, gravel, and construction materials'),
('budget-2', 'proj-1', 'Labor', 800000.00, 520000.00, 'Construction workers and skilled labor'),
('budget-3', 'proj-1', 'Equipment', 200000.00, 130000.00, 'Heavy machinery rental and maintenance'),
('budget-4', 'proj-2', 'Equipment', 1200000.00, 480000.00, 'Water treatment equipment and installation'),
('budget-5', 'proj-2', 'Infrastructure', 500000.00, 200000.00, 'Building construction and utilities'),
('budget-6', 'proj-2', 'Testing', 100000.00, 40000.00, 'System testing and quality assurance');

-- Insert cross-RDC project jurisdiction relationships
INSERT INTO project_jurisdictions (id, project_id, jurisdiction_id, relationship_type) VALUES
-- Georgetown-Linden Highway (spans multiple regions)
('pj-1', 'proj-6', 'region-1', 'primary'),
('pj-2', 'proj-6', 'region-4', 'secondary'),
('pj-3', 'proj-6', 'region-10', 'secondary'),
-- Coastal Protection System (regional project)
('pj-4', 'proj-7', 'region-2', 'primary'),
('pj-5', 'proj-7', 'region-3', 'secondary'),
('pj-6', 'proj-7', 'region-4', 'secondary'),
-- Cross-Border Trade Facility (serves multiple regions)
('pj-7', 'proj-8', 'region-1', 'primary'),
('pj-8', 'proj-8', 'region-7', 'secondary');

-- Insert sample project citizen updates
INSERT INTO project_citizen_updates (id, project_id, title, content, update_type, created_by) VALUES
('update-1', 'proj-1', 'Road Construction Progress Update', 'We are pleased to report that Phase 1 of the Mabaruma Road Repairs is 80% complete. The first 2km section has been paved and is ready for final inspection.', 'progress', 'admin-1'),
('update-2', 'proj-1', 'Traffic Diversion Notice', 'Please note that Main Street will be closed for 3 days starting Monday for final paving work. Alternative routes are available via Church Street.', 'general', 'admin-1'),
('update-3', 'proj-2', 'Water System Installation Begins', 'Construction of the new water treatment facility has begun. This will provide clean drinking water to over 15,000 residents in Anna Regina and surrounding areas.', 'milestone', 'admin-1'),
('update-4', 'proj-6', 'Highway Construction Update', 'The Georgetown-Linden Highway project is progressing well. Phase 1 (Georgetown to Timehri) is 60% complete with improved road conditions already visible.', 'progress', 'admin-1'),
('update-5', 'proj-7', 'Coastal Protection Milestone', 'The first phase of the coastal protection system has been completed in Region 2. This will protect over 50,000 residents from coastal flooding.', 'milestone', 'admin-1');

-- =============================================
-- INSERT PM TOOL SAMPLE DATA
-- =============================================

-- Insert PM role user
INSERT INTO users (id, username, email, password_hash, role) VALUES
('pm-1', 'pm', 'pm@region2.gov.gy', '$2b$10$example_hash', 'pm');

-- Update projects to include PM assignment and new status
UPDATE projects SET 
    assigned_to = 'pm-1', 
    assigned_at = '2024-01-15 10:00:00',
    status = 'initiate'
WHERE id = 'proj-4';

-- Insert schedule templates (our smart templates)
INSERT INTO schedule_templates (id, name, description, category, estimated_duration, icon, phases, documents) VALUES
('building-construction', 'Building Construction', 'Complete template for community centers, schools, and public buildings', 'infrastructure', '4-8 months', 'Building', 
'[
  {
    "id": "phase-1",
    "name": "Project Initiation",
    "description": "Initial project setup and stakeholder alignment",
    "estimatedDays": 7,
    "tasks": [
      {
        "id": "t1",
        "name": "Stakeholder meeting",
        "description": "Meet with community leaders and officials",
        "estimatedHours": 6,
        "subtasks": [
          {"id": "t1-1", "name": "Schedule meeting", "description": "Coordinate meeting time with all stakeholders", "estimatedHours": 1},
          {"id": "t1-2", "name": "Prepare agenda", "description": "Create meeting agenda and discussion points", "estimatedHours": 2},
          {"id": "t1-3", "name": "Send invitations", "description": "Send meeting invitations and materials", "estimatedHours": 1},
          {"id": "t1-4", "name": "Conduct meeting", "description": "Facilitate stakeholder meeting and discussions", "estimatedHours": 2}
        ]
      },
      {
        "id": "t2",
        "name": "Site survey",
        "description": "Conduct comprehensive site assessment",
        "estimatedHours": 8,
        "subtasks": [
          {"id": "t2-1", "name": "Topographical survey", "description": "Map site contours and features", "estimatedHours": 4},
          {"id": "t2-2", "name": "Soil testing", "description": "Test soil composition and bearing capacity", "estimatedHours": 2},
          {"id": "t2-3", "name": "Environmental assessment", "description": "Assess environmental impact and requirements", "estimatedHours": 2}
        ]
      },
      {
        "id": "t3",
        "name": "Budget confirmation",
        "description": "Finalize project budget and funding sources",
        "estimatedHours": 4
      }
    ]
  },
  {
    "id": "phase-2",
    "name": "Design & Planning",
    "description": "Architectural design and engineering planning",
    "estimatedDays": 21,
    "tasks": [
      {
        "id": "t4",
        "name": "Architectural design",
        "description": "Create building plans and specifications",
        "estimatedHours": 40,
        "subtasks": [
          {"id": "t4-1", "name": "Conceptual design", "description": "Develop initial building concepts", "estimatedHours": 16},
          {"id": "t4-2", "name": "Detailed drawings", "description": "Create detailed architectural drawings", "estimatedHours": 20},
          {"id": "t4-3", "name": "Design review", "description": "Review and approve design with stakeholders", "estimatedHours": 4}
        ]
      },
      {
        "id": "t5",
        "name": "Structural engineering",
        "description": "Design structural systems and load calculations",
        "estimatedHours": 24
      },
      {
        "id": "t6",
        "name": "MEP design",
        "description": "Mechanical, electrical, and plumbing design",
        "estimatedHours": 20
      }
    ]
  }
]',
'[
  {"name": "Building Permit", "description": "Official building permit from local authorities", "required": true},
  {"name": "Environmental Clearance", "description": "Environmental impact assessment approval", "required": true},
  {"name": "Structural Engineering Report", "description": "Certified structural engineering analysis", "required": true},
  {"name": "Fire Safety Certificate", "description": "Fire department safety approval", "required": true}
]'
);

-- Insert PM checklist templates
INSERT INTO pm_checklist_templates (id, task_type, task_keywords, checklist_items) VALUES
('meeting-checklist', 'meeting', '["meeting", "stakeholder", "discussion", "conference"]', 
'[
  {"id": "1", "text": "Send agenda 24 hours before meeting", "priority": "critical"},
  {"id": "2", "text": "Test projector/audio equipment", "priority": "critical"},
  {"id": "3", "text": "Prepare talking points and key messages", "priority": "important"},
  {"id": "4", "text": "Book meeting room or set up virtual link", "priority": "critical"},
  {"id": "5", "text": "Send reminder emails to attendees", "priority": "important"},
  {"id": "6", "text": "Prepare backup plan (recording, alternate host)", "priority": "nice-to-have"}
]'),

('survey-checklist', 'survey', '["survey", "site", "assessment", "inspection"]',
'[
  {"id": "1", "text": "Check weather forecast for survey day", "priority": "critical"},
  {"id": "2", "text": "Verify equipment is charged and working", "priority": "critical"},
  {"id": "3", "text": "Confirm site access permissions", "priority": "critical"},
  {"id": "4", "text": "Review safety protocols and requirements", "priority": "important"},
  {"id": "5", "text": "Prepare backup equipment and tools", "priority": "important"},
  {"id": "6", "text": "Notify local authorities if required", "priority": "nice-to-have"}
]'),

('budget-checklist', 'budget', '["budget", "cost", "financial", "funding"]',
'[
  {"id": "1", "text": "Review all funding sources and amounts", "priority": "critical"},
  {"id": "2", "text": "Verify cost breakdown accuracy", "priority": "critical"},
  {"id": "3", "text": "Check for any hidden or additional costs", "priority": "important"},
  {"id": "4", "text": "Prepare budget presentation materials", "priority": "important"},
  {"id": "5", "text": "Schedule approval meeting with authorities", "priority": "critical"}
]'),

('design-checklist', 'design', '["design", "architectural", "engineering", "planning"]',
'[
  {"id": "1", "text": "Review design requirements and specifications", "priority": "critical"},
  {"id": "2", "text": "Check compliance with local building codes", "priority": "critical"},
  {"id": "3", "text": "Verify accessibility requirements (ADA)", "priority": "important"},
  {"id": "4", "text": "Prepare design presentation materials", "priority": "important"},
  {"id": "5", "text": "Schedule design review meeting", "priority": "important"}
]'
);

-- =============================================
-- RISK/ISSUE/DECISION/ACTION MODULE (Phase 1)
-- =============================================

-- Project Risks Table
CREATE TABLE project_risks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('technical', 'financial', 'regulatory', 'stakeholder', 'environmental', 'operational', 'schedule', 'quality') NOT NULL,
    probability ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    impact ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    risk_score INT GENERATED ALWAYS AS (
        CASE 
            WHEN probability = 'low' AND impact = 'low' THEN 1
            WHEN probability = 'low' AND impact = 'medium' THEN 2
            WHEN probability = 'low' AND impact = 'high' THEN 3
            WHEN probability = 'low' AND impact = 'critical' THEN 4
            WHEN probability = 'medium' AND impact = 'low' THEN 2
            WHEN probability = 'medium' AND impact = 'medium' THEN 4
            WHEN probability = 'medium' AND impact = 'high' THEN 6
            WHEN probability = 'medium' AND impact = 'critical' THEN 8
            WHEN probability = 'high' AND impact = 'low' THEN 3
            WHEN probability = 'high' AND impact = 'medium' THEN 6
            WHEN probability = 'high' AND impact = 'high' THEN 9
            WHEN probability = 'high' AND impact = 'critical' THEN 12
            WHEN probability = 'critical' AND impact = 'low' THEN 4
            WHEN probability = 'critical' AND impact = 'medium' THEN 8
            WHEN probability = 'critical' AND impact = 'high' THEN 12
            WHEN probability = 'critical' AND impact = 'critical' THEN 16
            ELSE 0
        END
    ) STORED,
    status ENUM('identified', 'assessed', 'mitigated', 'monitored', 'closed', 'escalated') NOT NULL DEFAULT 'identified',
    mitigation_strategy TEXT,
    contingency_plan TEXT,
    owner_id VARCHAR(36),
    assigned_to VARCHAR(36),
    due_date DATE,
    escalated_to_issue_id VARCHAR(36) NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Issues Table
CREATE TABLE project_issues (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    risk_id VARCHAR(36) NULL, -- If escalated from risk
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('technical', 'financial', 'regulatory', 'stakeholder', 'environmental', 'operational', 'schedule', 'quality') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('open', 'investigating', 'resolving', 'resolved', 'closed', 'escalated') NOT NULL DEFAULT 'open',
    impact_description TEXT,
    root_cause TEXT,
    resolution_plan TEXT,
    actual_resolution TEXT,
    owner_id VARCHAR(36),
    assigned_to VARCHAR(36),
    reported_by VARCHAR(36) NOT NULL,
    due_date DATE,
    resolved_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (risk_id) REFERENCES project_risks(id) ON DELETE SET NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Decisions Table
CREATE TABLE project_decisions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    issue_id VARCHAR(36) NULL, -- If decision is related to an issue
    title VARCHAR(255) NOT NULL,
    description TEXT,
    decision_type ENUM('technical', 'business', 'resource', 'schedule', 'scope', 'quality', 'risk') NOT NULL,
    decision_status ENUM('pending', 'approved', 'rejected', 'deferred', 'implemented') NOT NULL DEFAULT 'pending',
    decision_criteria TEXT,
    options_considered TEXT,
    chosen_option TEXT,
    rationale TEXT,
    decision_maker VARCHAR(36),
    stakeholders JSON, -- Array of stakeholder IDs and their roles
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(36) NULL,
    approved_at TIMESTAMP NULL,
    implementation_deadline DATE,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (issue_id) REFERENCES project_issues(id) ON DELETE SET NULL,
    FOREIGN KEY (decision_maker) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Project Actions Table
CREATE TABLE project_actions (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    decision_id VARCHAR(36) NULL, -- If action is from a decision
    issue_id VARCHAR(36) NULL, -- If action is to resolve an issue
    risk_id VARCHAR(36) NULL, -- If action is to mitigate a risk
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_type ENUM('mitigation', 'resolution', 'implementation', 'monitoring', 'communication', 'escalation') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'cancelled', 'on_hold') NOT NULL DEFAULT 'pending',
    assigned_to VARCHAR(36),
    created_by VARCHAR(36) NOT NULL,
    due_date DATE,
    completed_date DATE NULL,
    completion_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (decision_id) REFERENCES project_decisions(id) ON DELETE SET NULL,
    FOREIGN KEY (issue_id) REFERENCES project_issues(id) ON DELETE SET NULL,
    FOREIGN KEY (risk_id) REFERENCES project_risks(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_project_risks_project_id ON project_risks(project_id);
CREATE INDEX idx_project_risks_status ON project_risks(status);
CREATE INDEX idx_project_risks_risk_score ON project_risks(risk_score);
CREATE INDEX idx_project_risks_assigned_to ON project_risks(assigned_to);

CREATE INDEX idx_project_issues_project_id ON project_issues(project_id);
CREATE INDEX idx_project_issues_status ON project_issues(status);
CREATE INDEX idx_project_issues_severity ON project_issues(severity);
CREATE INDEX idx_project_issues_assigned_to ON project_issues(assigned_to);

CREATE INDEX idx_project_decisions_project_id ON project_decisions(project_id);
CREATE INDEX idx_project_decisions_status ON project_decisions(decision_status);
CREATE INDEX idx_project_decisions_decision_maker ON project_decisions(decision_maker);

CREATE INDEX idx_project_actions_project_id ON project_actions(project_id);
CREATE INDEX idx_project_actions_status ON project_actions(status);
CREATE INDEX idx_project_actions_assigned_to ON project_actions(assigned_to);
CREATE INDEX idx_project_actions_due_date ON project_actions(due_date);

-- Sample data for testing
INSERT INTO project_risks (id, project_id, title, description, category, probability, impact, status, mitigation_strategy, owner_id, assigned_to, created_by) VALUES
('risk-1', 'proj-pm-1', 'Weather delays during construction', 'Heavy rainfall during construction season could delay project timeline', 'environmental', 'medium', 'high', 'identified', 'Monitor weather forecasts and have indoor work alternatives ready', 'user-6', 'user-6', 'user-6'),
('risk-2', 'proj-pm-1', 'Material cost inflation', 'Rising material costs could exceed budget allocation', 'financial', 'high', 'medium', 'assessed', 'Lock in material prices early and maintain 10% contingency buffer', 'user-6', 'user-6', 'user-6'),
('risk-3', 'proj-pm-2', 'Permit approval delays', 'Regulatory approval process may take longer than expected', 'regulatory', 'medium', 'high', 'monitored', 'Submit applications early and maintain regular contact with authorities', 'user-6', 'user-6', 'user-6');

INSERT INTO project_issues (id, project_id, title, description, category, severity, priority, status, impact_description, owner_id, assigned_to, reported_by) VALUES
('issue-1', 'proj-pm-1', 'Foundation excavation delays', 'Unexpected rock formation discovered during excavation', 'technical', 'high', 'high', 'investigating', 'Project timeline delayed by 2 weeks, additional costs for specialized equipment', 'user-6', 'user-6', 'user-6'),
('issue-2', 'proj-pm-2', 'Stakeholder resistance', 'Local community concerns about project impact', 'stakeholder', 'medium', 'medium', 'open', 'Potential delays in approval process and increased communication requirements', 'user-6', 'user-6', 'user-6');

INSERT INTO project_decisions (id, project_id, issue_id, title, description, decision_type, decision_status, decision_criteria, options_considered, chosen_option, rationale, decision_maker, created_by) VALUES
('decision-1', 'proj-pm-1', 'issue-1', 'Equipment rental vs purchase', 'Decide whether to rent specialized equipment or purchase for rock excavation', 'technical', 'approved', 'Cost, timeline, future use', '["Rent equipment for 2 weeks", "Purchase equipment", "Subcontract to specialized company"]', 'Subcontract to specialized company', 'Most cost-effective and fastest solution', 'user-6', 'user-6'),
('decision-2', 'proj-pm-2', 'issue-2', 'Community engagement approach', 'How to address community concerns about the project', 'stakeholder', 'pending', 'Transparency, community buy-in, timeline', '["Public meeting", "Individual consultations", "Information sessions"]', 'Public meeting', 'Most transparent and efficient approach', 'user-6', 'user-6');

INSERT INTO project_actions (id, project_id, decision_id, issue_id, title, description, action_type, priority, status, assigned_to, created_by, due_date) VALUES
('action-1', 'proj-pm-1', 'decision-1', 'issue-1', 'Contact specialized excavation company', 'Research and contact companies that specialize in rock excavation', 'resolution', 'high', 'in_progress', 'user-6', 'user-6', '2024-02-15'),
('action-2', 'proj-pm-2', 'decision-2', 'issue-2', 'Schedule public meeting', 'Organize and schedule public meeting to address community concerns', 'communication', 'medium', 'pending', 'user-6', 'user-6', '2024-02-20'),
('action-3', 'proj-pm-1', NULL, NULL, 'Monitor weather forecasts', 'Regular monitoring of weather conditions for construction planning', 'monitoring', 'medium', 'in_progress', 'user-6', 'user-6', '2024-03-01');
