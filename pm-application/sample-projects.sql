-- Sample Projects for PM Application
-- Adding the 4 previous projects: Anna Regina, etc.

INSERT INTO projects (id, name, description, status, priority, budget_allocated, budget_spent, currency, start_date, end_date, project_manager_id, created_by) VALUES
('proj-001', 'Anna Regina Infrastructure Development', 'Comprehensive infrastructure development project for Anna Regina including roads, utilities, and public facilities', 'active', 'high', 5000000, 1750000, 'USD', '2024-01-15', '2025-12-31', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),

('proj-002', 'Georgetown Smart City Initiative', 'Implementation of smart city technologies including IoT sensors, data analytics, and digital governance systems', 'planning', 'high', 8000000, 1200000, 'USD', '2024-03-01', '2026-06-30', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),

('proj-003', 'Berbice Agricultural Modernization', 'Modernization of agricultural practices in Berbice region with focus on sustainable farming and technology integration', 'active', 'medium', 3000000, 840000, 'USD', '2024-01-01', '2025-08-31', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),

('proj-004', 'Essequibo Coastal Protection', 'Coastal protection and climate resilience project for Essequibo region including sea walls and mangrove restoration', 'planning', 'high', 4500000, 225000, 'USD', '2024-04-01', '2026-03-31', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c');

-- Add some sample schedules for these projects
INSERT INTO schedules (id, project_id, name, description, status, progress_percentage, created_by) VALUES
('sched-001', 'proj-001', 'Anna Regina Phase 1', 'Initial infrastructure assessment and planning phase', 'active', 35, 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('sched-002', 'proj-001', 'Anna Regina Phase 2', 'Main construction and development phase', 'draft', 0, 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('sched-003', 'proj-002', 'Smart City Planning', 'Planning and design phase for smart city implementation', 'active', 15, 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('sched-004', 'proj-003', 'Agricultural Assessment', 'Assessment of current agricultural practices and modernization needs', 'active', 28, 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('sched-005', 'proj-004', 'Coastal Survey', 'Environmental survey and impact assessment for coastal protection', 'draft', 5, 'be96abc4-896c-4b1f-b427-a19fd26a407c');

-- Add some sample tasks for the schedules
INSERT INTO tasks (id, schedule_id, name, description, task_type, status, priority, assigned_to, created_by) VALUES
('task-001', 'sched-001', 'Site Survey', 'Conduct comprehensive site survey for Anna Regina infrastructure', 'phase', 'in_progress', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-002', 'sched-001', 'Environmental Impact Assessment', 'Complete EIA for infrastructure development', 'phase', 'not_started', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-003', 'sched-001', 'Stakeholder Consultation', 'Engage with local communities and stakeholders', 'phase', 'completed', 'medium', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-004', 'sched-003', 'Technology Assessment', 'Assess available smart city technologies', 'phase', 'in_progress', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-005', 'sched-003', 'Vendor Selection', 'Select technology vendors for smart city implementation', 'phase', 'not_started', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-006', 'sched-004', 'Farm Assessment', 'Assess current farming practices in Berbice region', 'phase', 'in_progress', 'medium', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-007', 'sched-004', 'Technology Integration Plan', 'Develop plan for agricultural technology integration', 'phase', 'not_started', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('task-008', 'sched-005', 'Coastal Mapping', 'Map coastal areas for protection planning', 'phase', 'not_started', 'high', 'be96abc4-896c-4b1f-b427-a19fd26a407c', 'be96abc4-896c-4b1f-b427-a19fd26a407c');

-- Add some sample templates
INSERT INTO schedule_templates (id, name, description, category, phases, created_by) VALUES
('templ-001', 'Infrastructure Development Template', 'Standard template for infrastructure development projects', 'Infrastructure', '["Planning", "Design", "Construction", "Testing", "Deployment"]', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('templ-002', 'Smart City Implementation Template', 'Template for smart city technology implementation projects', 'Technology', '["Assessment", "Planning", "Implementation", "Testing", "Deployment"]', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('templ-003', 'Agricultural Modernization Template', 'Template for agricultural modernization and technology integration', 'Agriculture', '["Assessment", "Planning", "Implementation", "Training", "Monitoring"]', 'be96abc4-896c-4b1f-b427-a19fd26a407c'),
('templ-004', 'Environmental Protection Template', 'Template for environmental protection and climate resilience projects', 'Environmental', '["Survey", "Planning", "Implementation", "Monitoring", "Maintenance"]', 'be96abc4-896c-4b1f-b427-a19fd26a407c');
