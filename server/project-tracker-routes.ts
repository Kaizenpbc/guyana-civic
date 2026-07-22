import type { Express } from "express";
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  ProjectListResponse,
  ProjectSummary,
  ProjectMilestone,
  ProjectCitizenUpdate,
  ProjectFeedback,
} from "../shared/project-tracker-types";

// Authentication middleware (reuse from main app)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

const requireStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["staff", "pm", "admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
};

// =============================================
// IN-MEMORY STORAGE
// =============================================

const projects = new Map<string, Project>();
const milestones = new Map<string, ProjectMilestone>();
const citizenUpdates = new Map<string, ProjectCitizenUpdate>();
const feedback = new Map<string, ProjectFeedback>();

let idCounter = Date.now();
function nextId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

// Seed data
function seedData() {
  const seedProjects: Project[] = [
    {
      id: 'proj-1',
      jurisdictionId: 'region-1',
      name: 'Mabaruma Road Repairs',
      description: 'Repair and upgrade main roads in Mabaruma area',
      category: 'infrastructure',
      priority: 'high',
      scope: 'local',
      fundingSource: 'local',
      budgetAllocated: 2500000,
      budgetSpent: 1625000,
      currency: 'GYD',
      plannedStartDate: '2024-01-01',
      plannedEndDate: '2024-06-30',
      actualStartDate: '2024-01-15',
      status: 'in_progress',
      progressPercentage: 65,
      createdBy: 'admin-1',
      isPublic: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'proj-2',
      jurisdictionId: 'region-2',
      name: 'Anna Regina Water System',
      description: 'Install new water treatment system for Anna Regina',
      category: 'infrastructure',
      priority: 'urgent',
      scope: 'local',
      fundingSource: 'local',
      budgetAllocated: 1800000,
      budgetSpent: 720000,
      currency: 'GYD',
      plannedStartDate: '2024-02-01',
      plannedEndDate: '2024-08-31',
      actualStartDate: '2024-02-10',
      status: 'in_progress',
      progressPercentage: 40,
      createdBy: 'admin-1',
      isPublic: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-10T00:00:00Z',
    },
    {
      id: 'proj-6',
      jurisdictionId: 'region-1',
      name: 'Georgetown-Linden Highway',
      description: 'Major highway construction connecting Georgetown (Region 4) to Linden (Region 10)',
      category: 'infrastructure',
      priority: 'urgent',
      scope: 'national',
      fundingSource: 'national',
      budgetAllocated: 15000000,
      budgetSpent: 4500000,
      currency: 'GYD',
      plannedStartDate: '2024-01-01',
      plannedEndDate: '2025-12-31',
      actualStartDate: '2024-01-15',
      status: 'in_progress',
      progressPercentage: 30,
      createdBy: 'admin-1',
      isPublic: true,
      jurisdictions: [
        { id: 'pj-1', projectId: 'proj-6', jurisdictionId: 'region-1', relationshipType: 'primary', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'pj-2', projectId: 'proj-6', jurisdictionId: 'region-4', relationshipType: 'secondary', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'pj-3', projectId: 'proj-6', jurisdictionId: 'region-10', relationshipType: 'secondary', createdAt: '2024-01-01T00:00:00Z' },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'proj-7',
      jurisdictionId: 'region-2',
      name: 'Coastal Protection System',
      description: 'Comprehensive coastal protection covering Regions 2, 3, and 4',
      category: 'infrastructure',
      priority: 'high',
      scope: 'regional',
      fundingSource: 'national',
      budgetAllocated: 25000000,
      budgetSpent: 7500000,
      currency: 'GYD',
      plannedStartDate: '2024-02-01',
      plannedEndDate: '2026-06-30',
      actualStartDate: '2024-02-15',
      status: 'in_progress',
      progressPercentage: 25,
      createdBy: 'admin-1',
      isPublic: true,
      jurisdictions: [
        { id: 'pj-4', projectId: 'proj-7', jurisdictionId: 'region-2', relationshipType: 'primary', createdAt: '2024-02-01T00:00:00Z' },
        { id: 'pj-5', projectId: 'proj-7', jurisdictionId: 'region-3', relationshipType: 'secondary', createdAt: '2024-02-01T00:00:00Z' },
        { id: 'pj-6', projectId: 'proj-7', jurisdictionId: 'region-4', relationshipType: 'secondary', createdAt: '2024-02-01T00:00:00Z' },
      ],
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-15T00:00:00Z',
    },
    {
      id: 'proj-pm-1',
      code: 'RDC2-000001',
      jurisdictionId: 'region-2',
      name: 'Essequibo Coast School Renovation',
      description: 'Complete renovation of primary school facilities in Essequibo Coast',
      category: 'education',
      priority: 'high',
      scope: 'local',
      fundingSource: 'regional',
      budgetAllocated: 3200000,
      budgetSpent: 1280000,
      currency: 'GYD',
      plannedStartDate: '2024-03-01',
      plannedEndDate: '2024-09-30',
      actualStartDate: '2024-03-05',
      status: 'in_progress',
      progressPercentage: 40,
      createdBy: 'admin-1',
      assignedTo: 'user-6',
      assignedAt: '2024-02-20T00:00:00Z',
      isPublic: true,
      createdAt: '2024-02-15T00:00:00Z',
      updatedAt: '2024-03-05T00:00:00Z',
    },
    {
      id: 'proj-pm-2',
      code: 'RDC2-000002',
      jurisdictionId: 'region-2',
      name: 'Pomeroon Health Center Upgrade',
      description: 'Upgrade medical facilities and equipment at Pomeroon Health Center',
      category: 'health',
      priority: 'urgent',
      scope: 'local',
      fundingSource: 'national',
      budgetAllocated: 4500000,
      budgetSpent: 0,
      currency: 'GYD',
      plannedStartDate: '2024-04-01',
      plannedEndDate: '2024-12-31',
      status: 'planning',
      progressPercentage: 5,
      createdBy: 'admin-1',
      assignedTo: 'user-6',
      assignedAt: '2024-03-01T00:00:00Z',
      isPublic: true,
      createdAt: '2024-02-28T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
    },
    {
      id: 'proj-pm-3',
      code: 'RDC2-000003',
      jurisdictionId: 'region-2',
      name: 'Charity Market Infrastructure',
      description: 'Build new market stalls and improve drainage at Charity Market',
      category: 'infrastructure',
      priority: 'medium',
      scope: 'local',
      fundingSource: 'local',
      budgetAllocated: 1800000,
      budgetSpent: 1440000,
      currency: 'GYD',
      plannedStartDate: '2024-01-15',
      plannedEndDate: '2024-05-15',
      actualStartDate: '2024-01-20',
      actualEndDate: '2024-05-10',
      status: 'completed',
      progressPercentage: 100,
      createdBy: 'admin-1',
      assignedTo: 'user-6',
      assignedAt: '2024-01-10T00:00:00Z',
      isPublic: true,
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-05-10T00:00:00Z',
    },
    {
      id: 'proj-pm-4',
      code: 'RDC2-000004',
      jurisdictionId: 'region-2',
      name: 'Anna Regina Sports Complex',
      description: 'Construction of modern sports complex with football field, basketball court, and community facilities in Anna Regina',
      category: 'infrastructure',
      priority: 'high',
      scope: 'local',
      fundingSource: 'regional',
      budgetAllocated: 7500000,
      budgetSpent: 0,
      currency: 'GYD',
      plannedStartDate: '2024-07-01',
      plannedEndDate: '2025-03-31',
      status: 'initiate',
      progressPercentage: 0,
      createdBy: 'admin-1',
      assignedTo: 'user-6',
      assignedAt: '2024-06-20T00:00:00Z',
      isPublic: true,
      createdAt: '2024-06-15T00:00:00Z',
      updatedAt: '2024-06-20T00:00:00Z',
    },
  ];

  for (const p of seedProjects) {
    projects.set(p.id, p);
  }

  // Seed milestones
  const seedMilestones: ProjectMilestone[] = [
    {
      id: 'milestone-1',
      projectId: 'proj-1',
      name: 'Site Survey Complete',
      description: 'Complete topographical survey and environmental assessment',
      dueDate: '2024-01-31',
      completedDate: '2024-01-30',
      status: 'completed',
      progressPercentage: 100,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-31T00:00:00Z',
    },
    {
      id: 'milestone-2',
      projectId: 'proj-1',
      name: 'Phase 1 Construction',
      description: 'Complete first 2km of road repairs',
      dueDate: '2024-04-30',
      status: 'in_progress',
      progressPercentage: 80,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ];

  for (const m of seedMilestones) {
    milestones.set(m.id, m);
  }

  // Seed citizen updates
  citizenUpdates.set('update-1', {
    id: 'update-1',
    projectId: 'proj-1',
    title: 'Road Construction Progress Update',
    content: 'We are pleased to report that Phase 1 of the Mabaruma Road Repairs is 80% complete.',
    updateType: 'progress',
    isPublic: true,
    createdBy: 'admin-1',
    createdAt: '2024-01-15T00:00:00Z',
  });
}

seedData();

// =============================================
// HELPERS
// =============================================

function applyFilters(allProjects: Project[], filters: ProjectFilters): Project[] {
  let result = allProjects;

  if (filters.jurisdictionId && filters.jurisdictionId.length > 0) {
    const ids = Array.isArray(filters.jurisdictionId) ? filters.jurisdictionId : [filters.jurisdictionId];
    result = result.filter(p => {
      if (ids.includes(p.jurisdictionId)) return true;
      if (p.jurisdictions) return p.jurisdictions.some(pj => ids.includes(pj.jurisdictionId));
      return false;
    });
  }
  if (filters.status) result = result.filter(p => p.status === filters.status);
  if (filters.category) result = result.filter(p => p.category === filters.category);
  if (filters.priority) result = result.filter(p => p.priority === filters.priority);
  if (filters.scope) result = result.filter(p => p.scope === filters.scope);
  if (filters.fundingSource) result = result.filter(p => p.fundingSource === filters.fundingSource);
  if (filters.assignedTo) result = result.filter(p => p.assignedTo === filters.assignedTo);
  if (filters.projectManagerId) result = result.filter(p => p.projectManagerId === filters.projectManagerId);
  if (filters.isPublic !== undefined) result = result.filter(p => p.isPublic === filters.isPublic);
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }

  // Sort
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  result.sort((a, b) => {
    const aVal = (a as any)[sortBy] ?? '';
    const bVal = (b as any)[sortBy] ?? '';
    const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
    return sortOrder === 'desc' ? -cmp : cmp;
  });

  return result;
}

function buildSummary(projectList: Project[]): ProjectSummary {
  const activeStatuses = ['in_progress', 'planning', 'approved', 'assigned', 'initiate'];
  const now = new Date();
  return {
    totalProjects: projectList.length,
    activeProjects: projectList.filter(p => activeStatuses.includes(p.status)).length,
    completedProjects: projectList.filter(p => p.status === 'completed').length,
    totalBudget: projectList.reduce((sum, p) => sum + p.budgetAllocated, 0),
    totalSpent: projectList.reduce((sum, p) => sum + p.budgetSpent, 0),
    averageProgress: projectList.length > 0
      ? Math.round(projectList.reduce((sum, p) => sum + p.progressPercentage, 0) / projectList.length)
      : 0,
    overdueProjects: projectList.filter(p =>
      p.status !== 'completed' && p.status !== 'cancelled' && new Date(p.plannedEndDate) < now
    ).length,
    projectsByCategory: projectList.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    projectsByStatus: projectList.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

// =============================================
// ROUTES
// =============================================

export function registerProjectTrackerRoutes(app: Express) {

  // Get all projects with filters
  app.get("/api/projects", async (req, res) => {
    try {
      let jurisdictionIds: string[] | undefined;
      if (req.query.jurisdictionId) {
        const param = req.query.jurisdictionId as string;
        jurisdictionIds = param.includes(',') ? param.split(',').map(id => id.trim()) : [param];
      }

      const filters: ProjectFilters = {
        jurisdictionId: jurisdictionIds,
        status: req.query.status as Project['status'],
        category: req.query.category as Project['category'],
        priority: req.query.priority as Project['priority'],
        scope: req.query.scope as Project['scope'],
        fundingSource: req.query.fundingSource as Project['fundingSource'],
        relationshipType: req.query.relationshipType as 'primary' | 'secondary' | 'affected',
        projectManagerId: req.query.projectManagerId as string,
        assignedTo: req.query.assignedTo as string,
        isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
        search: req.query.search as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'desc',
      };

      const allProjects = Array.from(projects.values());
      const filtered = applyFilters(allProjects, filters);

      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const start = (page - 1) * limit;
      const paged = filtered.slice(start, start + limit);

      const response: ProjectListResponse = {
        projects: paged,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = projects.get(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new project
  app.post("/api/projects", requireAuth, requireStaff, async (req, res) => {
    try {
      const d: CreateProjectRequest = req.body;
      const now = new Date().toISOString();
      const id = nextId('proj');

      const newProject: Project = {
        id,
        jurisdictionId: d.jurisdictionId,
        name: d.name,
        description: d.description,
        category: d.category,
        priority: d.priority,
        scope: d.scope || 'local',
        fundingSource: d.fundingSource || 'local',
        budgetAllocated: d.budgetAllocated,
        budgetSpent: 0,
        currency: 'GYD',
        plannedStartDate: d.plannedStartDate,
        plannedEndDate: d.plannedEndDate,
        actualStartDate: d.actualStartDate,
        actualEndDate: d.actualEndDate,
        status: 'planning',
        progressPercentage: 0,
        projectManagerId: d.projectManagerId,
        createdBy: req.user!.id,
        isPublic: d.isPublic ?? true,
        publicDescription: d.publicDescription,
        jurisdictions: (d.jurisdictions || []).map((j, i) => ({
          id: `${id}-j${i}`,
          projectId: id,
          jurisdictionId: j.jurisdictionId,
          relationshipType: j.relationshipType || 'primary',
          createdAt: now,
        })),
        createdAt: now,
        updatedAt: now,
      };

      projects.set(id, newProject);
      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Update project
  app.put("/api/projects/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const existing = projects.get(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Project not found" });
      }

      const updateData = req.body as Partial<Project>;
      const updated: Project = {
        ...existing,
        ...updateData,
        id: existing.id, // prevent id override
        createdAt: existing.createdAt,
        createdBy: existing.createdBy,
        updatedAt: new Date().toISOString(),
      };

      projects.set(updated.id, updated);
      res.json(updated);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const existed = projects.delete(req.params.id);
      if (!existed) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // MILESTONES
  // =============================================

  app.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const projectMilestones = Array.from(milestones.values())
        .filter(m => m.projectId === req.params.id);
      res.json(projectMilestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects/:id/milestones", requireAuth, requireStaff, async (req, res) => {
    try {
      const d = req.body;
      const now = new Date().toISOString();
      const milestone: ProjectMilestone = {
        id: nextId('milestone'),
        projectId: req.params.id,
        name: d.name,
        description: d.description,
        dueDate: d.dueDate,
        status: 'pending',
        progressPercentage: 0,
        createdAt: now,
        updatedAt: now,
      };
      milestones.set(milestone.id, milestone);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  app.put("/api/milestones/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const existing = milestones.get(req.params.id);
      if (!existing) return res.status(404).json({ error: "Milestone not found" });

      const updated: ProjectMilestone = {
        ...existing,
        ...req.body,
        id: existing.id,
        projectId: existing.projectId,
        updatedAt: new Date().toISOString(),
      };
      if (req.body.status === 'completed' && !updated.completedDate) {
        updated.completedDate = new Date().toISOString();
        updated.progressPercentage = 100;
      }
      milestones.set(updated.id, updated);
      res.json(updated);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(400).json({ error: "Invalid milestone data" });
    }
  });

  // =============================================
  // PUBLIC PROJECT DASHBOARD
  // =============================================

  app.get("/api/projects/public", async (req, res) => {
    try {
      const jurisdictionId = req.query.jurisdictionId as string;
      let publicProjects = Array.from(projects.values()).filter(p => p.isPublic);
      if (jurisdictionId) {
        publicProjects = publicProjects.filter(p => p.jurisdictionId === jurisdictionId);
      }
      res.json(publicProjects);
    } catch (error) {
      console.error("Error fetching public projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // SUMMARY & REPORTS
  // =============================================

  app.get("/api/projects/reports/summary", requireAuth, requireStaff, async (req, res) => {
    try {
      const jurisdictionId = req.query.jurisdictionId as string;
      let projectList = Array.from(projects.values());
      if (jurisdictionId) {
        projectList = projectList.filter(p => p.jurisdictionId === jurisdictionId);
      }
      res.json(buildSummary(projectList));
    } catch (error) {
      console.error("Error fetching project summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // CITIZEN ENGAGEMENT
  // =============================================

  app.get("/api/projects/:id/updates", async (req, res) => {
    try {
      const updates = Array.from(citizenUpdates.values())
        .filter(u => u.projectId === req.params.id);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching project updates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects/:id/updates", requireAuth, requireStaff, async (req, res) => {
    try {
      const d = req.body;
      const update: ProjectCitizenUpdate = {
        id: nextId('update'),
        projectId: req.params.id,
        title: d.title,
        content: d.content,
        updateType: d.updateType || 'general',
        isPublic: d.isPublic ?? true,
        createdBy: req.user!.id,
        createdAt: new Date().toISOString(),
      };
      citizenUpdates.set(update.id, update);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating project update:", error);
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  app.post("/api/projects/:id/feedback", async (req, res) => {
    try {
      const d = req.body;
      const now = new Date().toISOString();
      const newFeedback: ProjectFeedback = {
        id: nextId('feedback'),
        projectId: req.params.id,
        citizenId: d.citizenId,
        feedbackType: d.feedbackType,
        title: d.title,
        content: d.content,
        status: 'new',
        createdAt: now,
        updatedAt: now,
      };
      feedback.set(newFeedback.id, newFeedback);
      res.status(201).json(newFeedback);
    } catch (error) {
      console.error("Error creating project feedback:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });

  app.get("/api/projects/:id/feedback", async (req, res) => {
    try {
      const projectFeedback = Array.from(feedback.values())
        .filter(f => f.projectId === req.params.id);
      res.json(projectFeedback);
    } catch (error) {
      console.error("Error fetching project feedback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
