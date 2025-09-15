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
-- PROJECT MANAGEMENT MODULE
-- =============================================

CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    jurisdiction_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sector ENUM('roads', 'health', 'education', 'agriculture', 'water', 'other') NOT NULL,
    budget_amount DECIMAL(15, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
    progress_percentage INT DEFAULT 0,
    project_manager_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id),
    FOREIGN KEY (project_manager_id) REFERENCES employees(id)
);

CREATE TABLE project_tasks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(36),
    due_date DATE,
    completion_percentage INT DEFAULT 0,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES employees(id)
);

CREATE TABLE project_budgets (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated_amount DECIMAL(15, 2) NOT NULL,
    spent_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
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
INSERT INTO projects (id, jurisdiction_id, name, description, sector, budget_amount, start_date, end_date, status, progress_percentage) VALUES
('proj-1', 'region-1', 'Mabaruma Road Repairs', 'Repair and upgrade main roads in Mabaruma area', 'roads', 2500000.00, '2024-01-01', '2024-06-30', 'active', 65),
('proj-2', 'region-2', 'Anna Regina Water System', 'Install new water treatment system for Anna Regina', 'water', 1800000.00, '2024-02-01', '2024-08-31', 'active', 40),
('proj-3', 'region-1', 'Agricultural Training Program', 'Training program for local farmers', 'agriculture', 500000.00, '2024-03-01', '2024-12-31', 'planning', 0);
