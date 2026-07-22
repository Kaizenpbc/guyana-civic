import type { Express } from "express";

// Authentication middleware (reuse from main app)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

const requirePM = (req: any, res: any, next: any) => {
  if (!req.user || !["pm", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "PM access required" });
  }
  next();
};

// =============================================
// TYPES
// =============================================

interface ProjectSchedule {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  selectedPhases?: any[];
  selectedDocuments?: any[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  version: number;
  isCurrent: boolean;
  totalDurationDays?: number;
  totalTasks?: number;
  completedTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface SchedulePhase {
  id: string;
  scheduleId: string;
  phaseOrder: number;
  name: string;
  description?: string;
  estimatedDays: number;
  actualDays?: number;
  startDate?: string;
  endDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  progressPercentage: number;
  dependsOnPhases?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ScheduleTask {
  id: string;
  scheduleId: string;
  phaseId: string;
  parentTaskId?: string;
  taskOrder: number;
  level: number;
  isSubtask: boolean;
  name: string;
  description?: string;
  estimatedHours: number;
  actualHours?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  dependsOnTasks?: string[];
  assignedTo?: string;
  requiredSkills?: string[];
  deliverables?: string[];
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  progressPercentage: number;
  checklistItems?: any[];
  createdAt: string;
  updatedAt: string;
}

interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  estimatedDuration?: string;
  icon?: string;
  phases: any[];
  documents: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PMChecklistTemplate {
  id: string;
  taskType: string;
  taskKeywords: string[];
  checklistItems: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleHistoryEntry {
  id: string;
  scheduleId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  changeSummary: string;
  changedBy: string;
  changedAt: string;
}

// =============================================
// IN-MEMORY STORAGE
// =============================================

const schedules = new Map<string, ProjectSchedule>();
const phases = new Map<string, SchedulePhase>();
const tasks = new Map<string, ScheduleTask>();
const templates = new Map<string, ScheduleTemplate>();
const checklistTemplates = new Map<string, PMChecklistTemplate>();
const history = new Map<string, ScheduleHistoryEntry>();

let idCounter = Date.now();
function nextId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

// =============================================
// SEED DATA
// =============================================

function seedData() {
  const now = '2024-01-01T00:00:00Z';

  // Templates
  templates.set('building-construction', {
    id: 'building-construction',
    name: 'Building Construction',
    description: 'Complete template for community centers, schools, and public buildings',
    category: 'infrastructure',
    estimatedDuration: '4-8 months',
    icon: 'Building',
    phases: [
      {
        id: 'phase-1',
        name: 'Project Initiation',
        description: 'Initial project setup and stakeholder alignment',
        estimatedDays: 7,
        tasks: [
          {
            id: 't1', name: 'Stakeholder meeting',
            description: 'Meet with community leaders and officials',
            estimatedHours: 6,
            subtasks: [
              { id: 't1-1', name: 'Schedule meeting', description: 'Coordinate meeting time with all stakeholders', estimatedHours: 1 },
              { id: 't1-2', name: 'Prepare agenda', description: 'Create meeting agenda and discussion points', estimatedHours: 2 },
              { id: 't1-3', name: 'Send invitations', description: 'Send meeting invitations and materials', estimatedHours: 1 },
              { id: 't1-4', name: 'Conduct meeting', description: 'Facilitate stakeholder meeting and discussions', estimatedHours: 2 },
            ],
          },
          {
            id: 't2', name: 'Site survey',
            description: 'Conduct comprehensive site assessment',
            estimatedHours: 8,
            subtasks: [
              { id: 't2-1', name: 'Topographical survey', description: 'Map site contours and features', estimatedHours: 4 },
              { id: 't2-2', name: 'Soil testing', description: 'Test soil composition and bearing capacity', estimatedHours: 2 },
              { id: 't2-3', name: 'Environmental assessment', description: 'Assess environmental impact and requirements', estimatedHours: 2 },
            ],
          },
        ],
      },
    ],
    documents: [
      { name: 'Building Permit', description: 'Official building permit from local authorities', required: true },
      { name: 'Environmental Clearance', description: 'Environmental impact assessment approval', required: true },
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  // Checklist templates
  checklistTemplates.set('meeting-checklist', {
    id: 'meeting-checklist',
    taskType: 'meeting',
    taskKeywords: ['meeting', 'stakeholder', 'discussion', 'conference'],
    checklistItems: [
      { id: '1', text: 'Send agenda 24 hours before meeting', priority: 'critical' },
      { id: '2', text: 'Test projector/audio equipment', priority: 'critical' },
      { id: '3', text: 'Prepare talking points and key messages', priority: 'important' },
      { id: '4', text: 'Book meeting room or set up virtual link', priority: 'critical' },
      { id: '5', text: 'Send reminder emails to attendees', priority: 'important' },
      { id: '6', text: 'Prepare backup plan (recording, alternate host)', priority: 'nice-to-have' },
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  checklistTemplates.set('survey-checklist', {
    id: 'survey-checklist',
    taskType: 'survey',
    taskKeywords: ['survey', 'site', 'assessment', 'inspection'],
    checklistItems: [
      { id: '1', text: 'Check weather forecast for survey day', priority: 'critical' },
      { id: '2', text: 'Verify equipment is charged and working', priority: 'critical' },
      { id: '3', text: 'Confirm site access permissions', priority: 'critical' },
      { id: '4', text: 'Review safety protocols and requirements', priority: 'important' },
      { id: '5', text: 'Prepare backup equipment and tools', priority: 'important' },
      { id: '6', text: 'Notify local authorities if required', priority: 'nice-to-have' },
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
}

seedData();

// =============================================
// HELPERS
// =============================================

function getBySchedule<T extends { scheduleId: string }>(store: Map<string, T>, scheduleId: string): T[] {
  return Array.from(store.values()).filter(item => item.scheduleId === scheduleId);
}

function addHistory(scheduleId: string, action: string, entityType: string, entityId: string, oldValues: any, newValues: any, summary: string, userId: string) {
  const entry: ScheduleHistoryEntry = {
    id: nextId('history'),
    scheduleId,
    action,
    entityType,
    entityId,
    oldValues,
    newValues,
    changeSummary: summary,
    changedBy: userId,
    changedAt: new Date().toISOString(),
  };
  history.set(entry.id, entry);
}

// =============================================
// ROUTES
// =============================================

export function registerPMToolRoutes(app: Express) {

  // =============================================
  // PROJECT SCHEDULE MANAGEMENT
  // =============================================

  // Get all schedules for a project
  app.get("/api/projects/:projectId/schedules", requireAuth, requirePM, async (req, res) => {
    try {
      const projectSchedules = Array.from(schedules.values())
        .filter(s => s.projectId === req.params.projectId);
      res.json(projectSchedules);
    } catch (error) {
      console.error("Error fetching project schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current schedule for a project
  app.get("/api/projects/:projectId/schedules/current", requireAuth, requirePM, async (req, res) => {
    try {
      const projectSchedules = Array.from(schedules.values())
        .filter(s => s.projectId === req.params.projectId && s.isCurrent)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      if (projectSchedules.length > 0) {
        return res.json(projectSchedules[0]);
      }
      res.status(404).json({ error: 'No schedule found' });
    } catch (error) {
      console.error("Error fetching current schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new schedule from template
  app.post("/api/projects/:projectId/schedules", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { templateId, name, description, selectedPhases, selectedDocuments } = req.body;
      const now = new Date().toISOString();

      const template = templateId ? templates.get(templateId) : undefined;

      const newSchedule: ProjectSchedule = {
        id: nextId('schedule'),
        projectId,
        name: name || 'New Project Schedule',
        description,
        templateId,
        templateName: template?.name || (templateId ? 'Custom Template' : undefined),
        selectedPhases: selectedPhases || [],
        selectedDocuments: selectedDocuments || [],
        status: 'draft',
        version: 1,
        isCurrent: true,
        totalDurationDays: 0,
        totalTasks: 0,
        completedTasks: 0,
        progressPercentage: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: req.user!.id,
      };

      // Mark other schedules for this project as not current
      for (const s of schedules.values()) {
        if (s.projectId === projectId) s.isCurrent = false;
      }

      schedules.set(newSchedule.id, newSchedule);
      addHistory(newSchedule.id, 'created', 'schedule', newSchedule.id, null, { name: newSchedule.name, status: 'draft' }, `Schedule created${template ? ` from ${template.name} template` : ''}`, req.user!.id);

      res.status(201).json(newSchedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(400).json({ error: "Invalid schedule data" });
    }
  });

  // Update schedule
  app.put("/api/projects/:projectId/schedules/:scheduleId", requireAuth, requirePM, async (req, res) => {
    try {
      const existing = schedules.get(req.params.scheduleId);
      if (!existing) return res.status(404).json({ error: "Schedule not found" });

      const oldValues = { status: existing.status, name: existing.name };
      const updated: ProjectSchedule = {
        ...existing,
        ...req.body,
        id: existing.id,
        projectId: existing.projectId,
        createdAt: existing.createdAt,
        createdBy: existing.createdBy,
        updatedAt: new Date().toISOString(),
      };

      schedules.set(updated.id, updated);
      addHistory(updated.id, 'updated', 'schedule', updated.id, oldValues, req.body, 'Schedule updated', req.user!.id);

      res.json(updated);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(400).json({ error: "Invalid schedule data" });
    }
  });

  // Delete schedule
  app.delete("/api/projects/:projectId/schedules/current", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId } = req.params;
      const toDelete = Array.from(schedules.entries())
        .filter(([_, s]) => s.projectId === projectId && s.isCurrent);

      for (const [id] of toDelete) {
        schedules.delete(id);
        // Clean up related phases and tasks
        for (const [pid, p] of phases) { if (p.scheduleId === id) phases.delete(pid); }
        for (const [tid, t] of tasks) { if (t.scheduleId === id) tasks.delete(tid); }
      }

      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Add phases to existing schedule
  app.post("/api/projects/:projectId/schedules/:scheduleId/phases", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { selectedPhases, selectedDocuments, currentSchedule } = req.body;

      const existing = schedules.get(scheduleId) || currentSchedule;
      if (!existing) return res.status(404).json({ error: "Schedule not found" });

      const mergedPhases = [...(existing.selectedPhases || []), ...selectedPhases];
      const mergedDocuments = [...(existing.selectedDocuments || []), ...selectedDocuments];

      const updated: ProjectSchedule = {
        ...existing,
        selectedPhases: mergedPhases,
        selectedDocuments: mergedDocuments,
        updatedAt: new Date().toISOString(),
        totalTasks: (existing.totalTasks || 0) + selectedPhases.reduce((sum: number, phase: any) => sum + (phase.tasks?.length || 0), 0),
        totalDurationDays: (existing.totalDurationDays || 0) + selectedPhases.reduce((sum: number, phase: any) => sum + (phase.estimatedDays || 0), 0),
      };

      schedules.set(updated.id, updated);
      res.json(updated);
    } catch (error) {
      console.error("Error adding phases to schedule:", error);
      res.status(400).json({ error: "Invalid phase data" });
    }
  });

  // =============================================
  // SCHEDULE PHASES
  // =============================================

  app.get("/api/schedules/:scheduleId/phases", requireAuth, requirePM, async (req, res) => {
    try {
      const scheduleId = req.params.scheduleId;
      let schedulePhases = getBySchedule(phases, scheduleId);

      // If no phases stored yet, seed defaults for this schedule
      if (schedulePhases.length === 0) {
        const now = new Date().toISOString();
        const defaults: SchedulePhase[] = [
          {
            id: `phase-${scheduleId}-1`, scheduleId, phaseOrder: 1,
            name: 'Project Initiation', description: 'Initial project setup and stakeholder alignment',
            estimatedDays: 7, actualDays: 5, startDate: '2024-01-15', endDate: '2024-01-22',
            status: 'completed', progressPercentage: 100, dependsOnPhases: [],
            createdAt: now, updatedAt: now,
          },
          {
            id: `phase-${scheduleId}-2`, scheduleId, phaseOrder: 2,
            name: 'Design & Planning', description: 'Architectural design and engineering planning',
            estimatedDays: 21, actualDays: 18, startDate: '2024-01-23', endDate: '2024-02-12',
            status: 'in_progress', progressPercentage: 75, dependsOnPhases: [`phase-${scheduleId}-1`],
            createdAt: now, updatedAt: now,
          },
          {
            id: `phase-${scheduleId}-3`, scheduleId, phaseOrder: 3,
            name: 'Construction', description: 'Main construction phase',
            estimatedDays: 60, startDate: '2024-02-13', endDate: '2024-04-13',
            status: 'not_started', progressPercentage: 0, dependsOnPhases: [`phase-${scheduleId}-2`],
            createdAt: now, updatedAt: now,
          },
        ];
        for (const p of defaults) phases.set(p.id, p);
        schedulePhases = defaults;
      }

      res.json(schedulePhases.sort((a, b) => a.phaseOrder - b.phaseOrder));
    } catch (error) {
      console.error("Error fetching schedule phases:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // SCHEDULE TASKS
  // =============================================

  app.get("/api/schedules/:scheduleId/tasks", requireAuth, requirePM, async (req, res) => {
    try {
      const scheduleId = req.params.scheduleId;
      let scheduleTasks = getBySchedule(tasks, scheduleId);

      // If no tasks stored yet, seed defaults
      if (scheduleTasks.length === 0) {
        const now = new Date().toISOString();
        const userId = req.user!.id;
        const defaults: ScheduleTask[] = [
          {
            id: `task-${scheduleId}-1`, scheduleId, phaseId: `phase-${scheduleId}-1`,
            taskOrder: 1, level: 1, isSubtask: false,
            name: 'Stakeholder meeting', description: 'Meet with community leaders and officials',
            estimatedHours: 6, actualHours: 6,
            plannedStartDate: '2024-01-15', plannedEndDate: '2024-01-15',
            actualStartDate: '2024-01-15', actualEndDate: '2024-01-15',
            dependsOnTasks: [], assignedTo: userId,
            requiredSkills: ['Communication', 'Stakeholder Management'],
            deliverables: ['Meeting Minutes', 'Stakeholder Agreement'],
            status: 'completed', progressPercentage: 100,
            checklistItems: [
              { id: '1', text: 'Send agenda 24 hours before meeting', completed: true, priority: 'critical' },
              { id: '2', text: 'Test projector/audio equipment', completed: true, priority: 'critical' },
              { id: '3', text: 'Prepare talking points and key messages', completed: true, priority: 'important' },
            ],
            createdAt: now, updatedAt: now,
          },
          {
            id: `task-${scheduleId}-1-1`, scheduleId, phaseId: `phase-${scheduleId}-1`,
            parentTaskId: `task-${scheduleId}-1`,
            taskOrder: 1, level: 2, isSubtask: true,
            name: 'Schedule meeting', description: 'Coordinate meeting time with all stakeholders',
            estimatedHours: 1, actualHours: 1,
            plannedStartDate: '2024-01-15', plannedEndDate: '2024-01-15',
            actualStartDate: '2024-01-15', actualEndDate: '2024-01-15',
            dependsOnTasks: [], assignedTo: userId,
            requiredSkills: ['Scheduling', 'Communication'],
            deliverables: ['Meeting Schedule'],
            status: 'completed', progressPercentage: 100,
            createdAt: now, updatedAt: now,
          },
          {
            id: `task-${scheduleId}-2`, scheduleId, phaseId: `phase-${scheduleId}-1`,
            taskOrder: 2, level: 1, isSubtask: false,
            name: 'Site survey', description: 'Conduct comprehensive site assessment',
            estimatedHours: 8, actualHours: 8,
            plannedStartDate: '2024-01-16', plannedEndDate: '2024-01-17',
            actualStartDate: '2024-01-16', actualEndDate: '2024-01-17',
            dependsOnTasks: [`task-${scheduleId}-1`], assignedTo: userId,
            requiredSkills: ['Surveying', 'Environmental Assessment'],
            deliverables: ['Site Survey Report', 'Environmental Assessment'],
            status: 'completed', progressPercentage: 100,
            checklistItems: [
              { id: '1', text: 'Check weather forecast for survey day', completed: true, priority: 'critical' },
              { id: '2', text: 'Verify equipment is charged and working', completed: true, priority: 'critical' },
              { id: '3', text: 'Confirm site access permissions', completed: true, priority: 'critical' },
            ],
            createdAt: now, updatedAt: now,
          },
        ];
        for (const t of defaults) tasks.set(t.id, t);
        scheduleTasks = defaults;
      }

      res.json(scheduleTasks);
    } catch (error) {
      console.error("Error fetching schedule tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update task
  app.put("/api/schedules/:scheduleId/tasks/:taskId", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId, taskId } = req.params;
      const existing = tasks.get(taskId);

      const base: ScheduleTask = existing || {
        id: taskId, scheduleId, phaseId: `phase-${scheduleId}-1`,
        taskOrder: 1, level: 1, isSubtask: false,
        name: '', description: '', estimatedHours: 0,
        dependsOnTasks: [], status: 'not_started', progressPercentage: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };

      const updated: ScheduleTask = {
        ...base,
        ...req.body,
        id: taskId,
        scheduleId,
        updatedAt: new Date().toISOString(),
      };

      tasks.set(taskId, updated);
      addHistory(scheduleId, 'task_updated', 'task', taskId, existing ? { status: existing.status } : null, { status: updated.status }, `Task "${updated.name}" updated`, req.user!.id);

      res.json(updated);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  // Add subtask
  app.post("/api/schedules/:scheduleId/tasks/:parentTaskId/subtasks", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId, parentTaskId } = req.params;
      const { name, description, estimatedHours } = req.body;

      const parent = tasks.get(parentTaskId);
      const now = new Date().toISOString();

      const newSubtask: ScheduleTask = {
        id: nextId('task'),
        scheduleId,
        phaseId: parent?.phaseId || `phase-${scheduleId}-1`,
        parentTaskId,
        taskOrder: 1,
        level: (parent?.level || 1) + 1,
        isSubtask: true,
        name: name || 'New Subtask',
        description: description || '',
        estimatedHours: estimatedHours || 4,
        dependsOnTasks: [],
        assignedTo: req.user!.id,
        status: 'not_started',
        progressPercentage: 0,
        createdAt: now,
        updatedAt: now,
      };

      tasks.set(newSubtask.id, newSubtask);
      addHistory(scheduleId, 'task_added', 'task', newSubtask.id, null, { name: newSubtask.name }, `Subtask "${newSubtask.name}" added`, req.user!.id);

      res.status(201).json(newSubtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(400).json({ error: "Invalid subtask data" });
    }
  });

  // Save all tasks for a schedule (bulk)
  app.post("/api/schedules/:scheduleId/tasks/bulk", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { tasks: taskList } = req.body;

      // Clear existing tasks for this schedule
      for (const [id, t] of tasks) {
        if (t.scheduleId === scheduleId) tasks.delete(id);
      }

      // Store new tasks
      for (const task of taskList) {
        tasks.set(task.id, { ...task, scheduleId });
      }

      res.json({ success: true, message: 'Tasks saved successfully', taskCount: taskList.length });
    } catch (error) {
      console.error("Error saving bulk tasks:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  // =============================================
  // SCHEDULE TEMPLATES
  // =============================================

  app.get("/api/schedule-templates", requireAuth, requirePM, async (req, res) => {
    try {
      const allTemplates = Array.from(templates.values()).filter(t => t.isActive);
      res.json(allTemplates);
    } catch (error) {
      console.error("Error fetching schedule templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // PM CHECKLIST TEMPLATES
  // =============================================

  app.get("/api/pm-checklist-templates", requireAuth, requirePM, async (req, res) => {
    try {
      const allChecklists = Array.from(checklistTemplates.values()).filter(c => c.isActive);
      res.json(allChecklists);
    } catch (error) {
      console.error("Error fetching PM checklist templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/pm-checklist-templates/:taskType", requireAuth, requirePM, async (req, res) => {
    try {
      const { taskType } = req.params;

      // Find matching checklist by taskType or keywords
      const match = Array.from(checklistTemplates.values()).find(c =>
        c.taskType === taskType || c.taskKeywords.some(kw => taskType.toLowerCase().includes(kw))
      );

      if (match) return res.json(match);

      // Generate a generic checklist for unknown task types
      res.json({
        id: `${taskType}-checklist`,
        taskType,
        taskKeywords: [taskType],
        checklistItems: [
          { id: '1', text: `Review ${taskType} requirements and deliverables`, priority: 'critical' },
          { id: '2', text: 'Check resource availability and allocation', priority: 'important' },
          { id: '3', text: 'Verify timeline and dependencies', priority: 'important' },
          { id: '4', text: 'Prepare necessary documentation', priority: 'nice-to-have' },
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching checklist template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // SCHEDULE HISTORY & AUDIT TRAIL
  // =============================================

  app.get("/api/schedules/:scheduleId/history", requireAuth, requirePM, async (req, res) => {
    try {
      const scheduleHistory = Array.from(history.values())
        .filter(h => h.scheduleId === req.params.scheduleId)
        .sort((a, b) => b.changedAt.localeCompare(a.changedAt));
      res.json(scheduleHistory);
    } catch (error) {
      console.error("Error fetching schedule history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
