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

// Types for our PM tool
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

// Simple in-memory store for updated schedules (in production, this would be a database)
const updatedSchedules: { [key: string]: ProjectSchedule } = {};
const updatedTasks: { [key: string]: ScheduleTask[] } = {};

export function registerPMToolRoutes(app: Express) {
  
  // =============================================
  // PROJECT SCHEDULE MANAGEMENT
  // =============================================
  
  // Delete schedule (for testing)
  app.delete("/api/projects/:projectId/schedules/current", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId } = req.params;
      const scheduleId = `schedule-${projectId}-current`;
      
      // Clear from memory
      delete updatedSchedules[scheduleId];
      delete updatedTasks[scheduleId];
      
      console.log(`Deleted schedule for project ${projectId}`);
      res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Get all schedules for a project
  app.get("/api/projects/:projectId/schedules", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      // TODO: Implement database query
      // For now, return mock data
      const mockSchedules: ProjectSchedule[] = [
        {
          id: `schedule-${projectId}-1`,
          projectId: projectId,
          name: "Main Project Schedule",
          description: "Primary project schedule with all phases and tasks",
          templateId: "building-construction",
          templateName: "Building Construction",
          status: "active",
          version: 1,
          isCurrent: true,
          totalDurationDays: 120,
          totalTasks: 15,
          completedTasks: 3,
          progressPercentage: 20,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-20T14:30:00Z",
          createdBy: req.user.id
        }
      ];

      res.json(mockSchedules);
    } catch (error) {
      console.error("Error fetching project schedules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current schedule for a project
  app.get("/api/projects/:projectId/schedules/current", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId } = req.params;
      
      console.log('🔍 Looking for schedules for project:', projectId);
      console.log('📋 All schedules in memory:', Object.keys(updatedSchedules));
      
      // Look for any schedule for this project (they all start with schedule-{projectId}-)
      const projectSchedules = Object.keys(updatedSchedules).filter(key => 
        key.startsWith(`schedule-${projectId}-`)
      );
      
      console.log('🎯 Found project schedules:', projectSchedules);
      
      if (projectSchedules.length > 0) {
        // Get the most recent schedule (highest timestamp)
        const latestScheduleKey = projectSchedules.sort().pop();
        const latestSchedule = updatedSchedules[latestScheduleKey!];
        console.log('✅ Returning latest schedule from memory:', latestSchedule);
        return res.json(latestSchedule);
      }
      
      // No schedule exists - return 404
      console.log('❌ No schedule found for project:', projectId);
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
      
      // TODO: Implement database insert
      const newSchedule: ProjectSchedule = {
        id: `schedule-${projectId}-${Date.now()}`,
        projectId: projectId,
        name: name || "New Project Schedule",
        description: description,
        templateId: templateId,
        templateName: templateId === "building-construction" ? "Building Construction" : "Custom Template",
        selectedPhases: selectedPhases || [],
        selectedDocuments: selectedDocuments || [],
        status: "draft",
        version: 1,
        isCurrent: true,
        totalDurationDays: 0,
        totalTasks: 0,
        completedTasks: 0,
        progressPercentage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user.id
      };

      // Store the schedule in memory
      updatedSchedules[newSchedule.id] = newSchedule;
      console.log('💾 Stored new schedule in memory:', newSchedule);
      console.log('📊 Total schedules in memory:', Object.keys(updatedSchedules).length);
      console.log('🔑 Schedule ID stored:', newSchedule.id);
      console.log('📋 All schedule keys after storage:', Object.keys(updatedSchedules));

      res.status(201).json(newSchedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(400).json({ error: "Invalid schedule data" });
    }
  });

  // Update schedule
  app.put("/api/projects/:projectId/schedules/:scheduleId", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId, scheduleId } = req.params;
      const updateData = req.body;
      
      console.log('Updating schedule:', scheduleId, 'with data:', updateData);
      
      // TODO: Implement database update
      const updatedSchedule: ProjectSchedule = {
        id: scheduleId,
        projectId: projectId,
        name: "Updated Schedule",
        description: "Updated schedule description",
        templateId: "building-construction",
        templateName: "Building Construction",
        status: "active",
        version: 1,
        isCurrent: true,
        totalDurationDays: 120,
        totalTasks: 15,
        completedTasks: 3,
        progressPercentage: 20,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString(),
        createdBy: req.user.id,
        ...updateData
      };

      // Store the updated schedule in memory
      updatedSchedules[scheduleId] = updatedSchedule;
      console.log('Stored updated schedule in memory:', updatedSchedule);

      console.log('Returning updated schedule:', updatedSchedule);
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(400).json({ error: "Invalid schedule data" });
    }
  });

  // Add phases to existing schedule
  app.post("/api/projects/:projectId/schedules/:scheduleId/phases", requireAuth, requirePM, async (req, res) => {
    try {
      const { projectId, scheduleId } = req.params;
      const { selectedPhases, selectedDocuments, currentSchedule } = req.body;
      
      console.log(`Adding phases to schedule ${scheduleId}:`, selectedPhases);
      console.log('Current schedule data:', currentSchedule);
      
      // Merge the new phases with existing ones
      const existingPhases = currentSchedule?.selectedPhases || [];
      const existingDocuments = currentSchedule?.selectedDocuments || [];
      
      // Create merged data
      const mergedPhases = [...existingPhases, ...selectedPhases];
      const mergedDocuments = [...existingDocuments, ...selectedDocuments];
      
      // Return the updated schedule with merged data
      const updatedSchedule: ProjectSchedule = {
        ...currentSchedule,
        selectedPhases: mergedPhases,
        selectedDocuments: mergedDocuments,
        updatedAt: new Date().toISOString(),
        totalTasks: (currentSchedule?.totalTasks || 0) + selectedPhases.reduce((sum: number, phase: any) => sum + (phase.tasks?.length || 0), 0),
        totalDurationDays: (currentSchedule?.totalDurationDays || 0) + selectedPhases.reduce((sum: number, phase: any) => sum + (phase.estimatedDays || 0), 0)
      };

      console.log('Returning updated schedule:', updatedSchedule);
      res.status(200).json(updatedSchedule);
    } catch (error) {
      console.error("Error adding phases to schedule:", error);
      res.status(400).json({ error: "Invalid phase data" });
    }
  });

  // =============================================
  // SCHEDULE PHASES
  // =============================================
  
  // Get phases for a schedule
  app.get("/api/schedules/:scheduleId/phases", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      
      // TODO: Implement database query
      const mockPhases: SchedulePhase[] = [
        {
          id: `phase-${scheduleId}-1`,
          scheduleId: scheduleId,
          phaseOrder: 1,
          name: "Project Initiation",
          description: "Initial project setup and stakeholder alignment",
          estimatedDays: 7,
          actualDays: 5,
          startDate: "2024-01-15",
          endDate: "2024-01-22",
          status: "completed",
          progressPercentage: 100,
          dependsOnPhases: [],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-22T16:00:00Z"
        },
        {
          id: `phase-${scheduleId}-2`,
          scheduleId: scheduleId,
          phaseOrder: 2,
          name: "Design & Planning",
          description: "Architectural design and engineering planning",
          estimatedDays: 21,
          actualDays: 18,
          startDate: "2024-01-23",
          endDate: "2024-02-12",
          status: "in_progress",
          progressPercentage: 75,
          dependsOnPhases: [`phase-${scheduleId}-1`],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-02-05T14:30:00Z"
        },
        {
          id: `phase-${scheduleId}-3`,
          scheduleId: scheduleId,
          phaseOrder: 3,
          name: "Construction",
          description: "Main construction phase",
          estimatedDays: 60,
          startDate: "2024-02-13",
          endDate: "2024-04-13",
          status: "not_started",
          progressPercentage: 0,
          dependsOnPhases: [`phase-${scheduleId}-2`],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        }
      ];

      res.json(mockPhases);
    } catch (error) {
      console.error("Error fetching schedule phases:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // SCHEDULE TASKS
  // =============================================
  
  // Get tasks for a schedule
  app.get("/api/schedules/:scheduleId/tasks", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      
      // Check if we have updated tasks in memory
      if (updatedTasks[scheduleId]) {
        console.log('Returning updated tasks from memory:', updatedTasks[scheduleId]);
        return res.json(updatedTasks[scheduleId]);
      }
      
      // TODO: Implement database query
      const mockTasks: ScheduleTask[] = [
        {
          id: `task-${scheduleId}-1`,
          scheduleId: scheduleId,
          phaseId: `phase-${scheduleId}-1`,
          taskOrder: 1,
          level: 1,
          isSubtask: false,
          name: "Stakeholder meeting",
          description: "Meet with community leaders and officials",
          estimatedHours: 6,
          actualHours: 6,
          plannedStartDate: "2024-01-15",
          plannedEndDate: "2024-01-15",
          actualStartDate: "2024-01-15",
          actualEndDate: "2024-01-15",
          dependsOnTasks: [],
          assignedTo: req.user.id,
          requiredSkills: ["Communication", "Stakeholder Management"],
          deliverables: ["Meeting Minutes", "Stakeholder Agreement"],
          status: "completed",
          progressPercentage: 100,
          checklistItems: [
            { id: "1", text: "Send agenda 24 hours before meeting", completed: true, priority: "critical" },
            { id: "2", text: "Test projector/audio equipment", completed: true, priority: "critical" },
            { id: "3", text: "Prepare talking points and key messages", completed: true, priority: "important" }
          ],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T16:00:00Z"
        },
        {
          id: `task-${scheduleId}-1-1`,
          scheduleId: scheduleId,
          phaseId: `phase-${scheduleId}-1`,
          parentTaskId: `task-${scheduleId}-1`,
          taskOrder: 1,
          level: 2,
          isSubtask: true,
          name: "Schedule meeting",
          description: "Coordinate meeting time with all stakeholders",
          estimatedHours: 1,
          actualHours: 1,
          plannedStartDate: "2024-01-15",
          plannedEndDate: "2024-01-15",
          actualStartDate: "2024-01-15",
          actualEndDate: "2024-01-15",
          dependsOnTasks: [],
          assignedTo: req.user.id,
          requiredSkills: ["Scheduling", "Communication"],
          deliverables: ["Meeting Schedule"],
          status: "completed",
          progressPercentage: 100,
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z"
        },
        {
          id: `task-${scheduleId}-2`,
          scheduleId: scheduleId,
          phaseId: `phase-${scheduleId}-1`,
          taskOrder: 2,
          level: 1,
          isSubtask: false,
          name: "Site survey",
          description: "Conduct comprehensive site assessment",
          estimatedHours: 8,
          actualHours: 8,
          plannedStartDate: "2024-01-16",
          plannedEndDate: "2024-01-17",
          actualStartDate: "2024-01-16",
          actualEndDate: "2024-01-17",
          dependsOnTasks: [`task-${scheduleId}-1`],
          assignedTo: req.user.id,
          requiredSkills: ["Surveying", "Environmental Assessment"],
          deliverables: ["Site Survey Report", "Environmental Assessment"],
          status: "completed",
          progressPercentage: 100,
          checklistItems: [
            { id: "1", text: "Check weather forecast for survey day", completed: true, priority: "critical" },
            { id: "2", text: "Verify equipment is charged and working", completed: true, priority: "critical" },
            { id: "3", text: "Confirm site access permissions", completed: true, priority: "critical" }
          ],
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-17T16:00:00Z"
        }
      ];

      res.json(mockTasks);
    } catch (error) {
      console.error("Error fetching schedule tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update task
  app.put("/api/schedules/:scheduleId/tasks/:taskId", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId, taskId } = req.params;
      const updateData = req.body;
      
      // TODO: Implement database update
      const updatedTask: ScheduleTask = {
        id: taskId,
        scheduleId: scheduleId,
        phaseId: `phase-${scheduleId}-1`,
        taskOrder: 1,
        level: 1,
        isSubtask: false,
        name: "Updated Task",
        description: "Updated task description",
        estimatedHours: 8,
        actualHours: 6,
        plannedStartDate: "2024-01-15",
        plannedEndDate: "2024-01-16",
        actualStartDate: "2024-01-15",
        actualEndDate: "2024-01-16",
        dependsOnTasks: [],
        assignedTo: req.user.id,
        requiredSkills: ["Updated Skills"],
        deliverables: ["Updated Deliverables"],
        status: "in_progress",
        progressPercentage: 75,
        checklistItems: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: new Date().toISOString(),
        ...updateData
      };

      res.json(updatedTask);
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
      
      // TODO: Implement database insert
      const newSubtask: ScheduleTask = {
        id: `task-${scheduleId}-${parentTaskId}-sub-${Date.now()}`,
        scheduleId: scheduleId,
        phaseId: `phase-${scheduleId}-1`,
        parentTaskId: parentTaskId,
        taskOrder: 1,
        level: 2,
        isSubtask: true,
        name: name || "New Subtask",
        description: description || "Click to edit description",
        estimatedHours: estimatedHours || 4,
        dependsOnTasks: [],
        assignedTo: req.user.id,
        requiredSkills: ["TBD"],
        deliverables: ["TBD"],
        status: "not_started",
        progressPercentage: 0,
        checklistItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(newSubtask);
    } catch (error) {
      console.error("Error creating subtask:", error);
      res.status(400).json({ error: "Invalid subtask data" });
    }
  });

  // Save all tasks for a schedule
  app.post("/api/schedules/:scheduleId/tasks/bulk", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const { tasks } = req.body;
      
      console.log('Saving bulk tasks for schedule:', scheduleId, 'tasks:', tasks);
      
      // Store the tasks in memory
      updatedTasks[scheduleId] = tasks;
      console.log('💾 Stored tasks in memory for schedule:', scheduleId);
      console.log('📊 Total tasks stored:', tasks.length);
      console.log('🔑 Task storage key:', scheduleId);
      console.log('📋 All task keys in memory:', Object.keys(updatedTasks));

      res.status(200).json({ 
        success: true, 
        message: "Tasks saved successfully",
        taskCount: tasks.length 
      });
    } catch (error) {
      console.error("Error saving bulk tasks:", error);
      res.status(400).json({ error: "Invalid task data" });
    }
  });

  // =============================================
  // SCHEDULE TEMPLATES
  // =============================================
  
  // Get all available templates
  app.get("/api/schedule-templates", requireAuth, requirePM, async (req, res) => {
    try {
      // TODO: Implement database query
      const mockTemplates: ScheduleTemplate[] = [
        {
          id: "building-construction",
          name: "Building Construction",
          description: "Complete template for community centers, schools, and public buildings",
          category: "infrastructure",
          estimatedDuration: "4-8 months",
          icon: "Building",
          phases: [
            {
              id: "phase-1",
              name: "Project Initiation",
              description: "Initial project setup and stakeholder alignment",
              estimatedDays: 7,
              tasks: [
                {
                  id: "t1",
                  name: "Stakeholder meeting",
                  description: "Meet with community leaders and officials",
                  estimatedHours: 6,
                  subtasks: [
                    { id: "t1-1", name: "Schedule meeting", description: "Coordinate meeting time with all stakeholders", estimatedHours: 1 },
                    { id: "t1-2", name: "Prepare agenda", description: "Create meeting agenda and discussion points", estimatedHours: 2 },
                    { id: "t1-3", name: "Send invitations", description: "Send meeting invitations and materials", estimatedHours: 1 },
                    { id: "t1-4", name: "Conduct meeting", description: "Facilitate stakeholder meeting and discussions", estimatedHours: 2 }
                  ]
                },
                {
                  id: "t2",
                  name: "Site survey",
                  description: "Conduct comprehensive site assessment",
                  estimatedHours: 8,
                  subtasks: [
                    { id: "t2-1", name: "Topographical survey", description: "Map site contours and features", estimatedHours: 4 },
                    { id: "t2-2", name: "Soil testing", description: "Test soil composition and bearing capacity", estimatedHours: 2 },
                    { id: "t2-3", name: "Environmental assessment", description: "Assess environmental impact and requirements", estimatedHours: 2 }
                  ]
                }
              ]
            }
          ],
          documents: [
            { name: "Building Permit", description: "Official building permit from local authorities", required: true },
            { name: "Environmental Clearance", description: "Environmental impact assessment approval", required: true }
          ],
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        }
      ];

      res.json(mockTemplates);
    } catch (error) {
      console.error("Error fetching schedule templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // PM CHECKLIST TEMPLATES
  // =============================================
  
  // Get PM checklist templates
  app.get("/api/pm-checklist-templates", requireAuth, requirePM, async (req, res) => {
    try {
      // TODO: Implement database query
      const mockChecklistTemplates: PMChecklistTemplate[] = [
        {
          id: "meeting-checklist",
          taskType: "meeting",
          taskKeywords: ["meeting", "stakeholder", "discussion", "conference"],
          checklistItems: [
            { id: "1", text: "Send agenda 24 hours before meeting", priority: "critical" },
            { id: "2", text: "Test projector/audio equipment", priority: "critical" },
            { id: "3", text: "Prepare talking points and key messages", priority: "important" },
            { id: "4", text: "Book meeting room or set up virtual link", priority: "critical" },
            { id: "5", text: "Send reminder emails to attendees", priority: "important" },
            { id: "6", text: "Prepare backup plan (recording, alternate host)", priority: "nice-to-have" }
          ],
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "survey-checklist",
          taskType: "survey",
          taskKeywords: ["survey", "site", "assessment", "inspection"],
          checklistItems: [
            { id: "1", text: "Check weather forecast for survey day", priority: "critical" },
            { id: "2", text: "Verify equipment is charged and working", priority: "critical" },
            { id: "3", text: "Confirm site access permissions", priority: "critical" },
            { id: "4", text: "Review safety protocols and requirements", priority: "important" },
            { id: "5", text: "Prepare backup equipment and tools", priority: "important" },
            { id: "6", text: "Notify local authorities if required", priority: "nice-to-have" }
          ],
          isActive: true,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        }
      ];

      res.json(mockChecklistTemplates);
    } catch (error) {
      console.error("Error fetching PM checklist templates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get checklist for specific task type
  app.get("/api/pm-checklist-templates/:taskType", requireAuth, requirePM, async (req, res) => {
    try {
      const { taskType } = req.params;
      
      // TODO: Implement database query
      const mockChecklist = {
        id: `${taskType}-checklist`,
        taskType: taskType,
        taskKeywords: [taskType],
        checklistItems: [
          { id: "1", text: `Review ${taskType} requirements and deliverables`, priority: "critical" },
          { id: "2", text: "Check resource availability and allocation", priority: "important" },
          { id: "3", text: "Verify timeline and dependencies", priority: "important" },
          { id: "4", text: "Prepare necessary documentation", priority: "nice-to-have" }
        ],
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z"
      };

      res.json(mockChecklist);
    } catch (error) {
      console.error("Error fetching checklist template:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // SCHEDULE HISTORY & AUDIT TRAIL
  // =============================================
  
  // Get schedule change history
  app.get("/api/schedules/:scheduleId/history", requireAuth, requirePM, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      
      // TODO: Implement database query
      const mockHistory = [
        {
          id: `history-${scheduleId}-1`,
          scheduleId: scheduleId,
          action: "created",
          entityType: "schedule",
          entityId: scheduleId,
          oldValues: null,
          newValues: { name: "Main Project Schedule", status: "draft" },
          changeSummary: "Schedule created from Building Construction template",
          changedBy: req.user.id,
          changedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: `history-${scheduleId}-2`,
          scheduleId: scheduleId,
          action: "task_added",
          entityType: "task",
          entityId: `task-${scheduleId}-1`,
          oldValues: null,
          newValues: { name: "Stakeholder meeting", estimatedHours: 6 },
          changeSummary: "Added Stakeholder meeting task",
          changedBy: req.user.id,
          changedAt: "2024-01-15T10:30:00Z"
        }
      ];

      res.json(mockHistory);
    } catch (error) {
      console.error("Error fetching schedule history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
