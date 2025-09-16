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
