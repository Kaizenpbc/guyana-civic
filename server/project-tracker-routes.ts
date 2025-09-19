import type { Express } from "express";
import { 
  Project, 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectFilters, 
  ProjectListResponse,
  ProjectSummary,
  ProjectMilestone,
  ProjectTeamMember,
  ProjectContractor,
  ProjectBudgetCategory,
  ProjectCitizenUpdate,
  ProjectFeedback,
  ProjectDocument,
  ProjectIssue
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

export function registerProjectTrackerRoutes(app: Express) {
  
  // =============================================
  // PROJECT MANAGEMENT ENDPOINTS
  // =============================================
  
  // Get all projects with filters
  app.get("/api/projects", async (req, res) => {
    try {
      // Handle multiple jurisdiction IDs (comma-separated or array)
      let jurisdictionIds: string[] | undefined;
      if (req.query.jurisdictionId) {
        const jurisdictionParam = req.query.jurisdictionId as string;
        jurisdictionIds = jurisdictionParam.includes(',') 
          ? jurisdictionParam.split(',').map(id => id.trim())
          : [jurisdictionParam];
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
        sortOrder: (req.query.sortOrder as any) || 'desc'
      };

      // TODO: Implement database query with filters
      // For now, return mock data with cross-RDC support

      // If assignedTo is specified (PM Dashboard), return PM-specific projects
      if (filters.assignedTo === 'user-6') {
        const pmProjects: Project[] = [
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
            updatedAt: '2024-03-05T00:00:00Z'
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
            updatedAt: '2024-03-01T00:00:00Z'
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
            updatedAt: '2024-05-10T00:00:00Z'
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
            budgetAllocated: 5500000,
            budgetSpent: 1100000,
            currency: 'GYD',
            plannedStartDate: '2024-02-01',
            plannedEndDate: '2024-11-30',
            actualStartDate: '2024-02-15',
            status: 'in_progress',
            progressPercentage: 20,
            createdBy: 'admin-1',
            assignedTo: 'user-6',
            assignedAt: '2024-01-25T00:00:00Z',
            isPublic: true,
            createdAt: '2024-01-20T00:00:00Z',
            updatedAt: '2024-02-15T00:00:00Z'
          }
        ];

        return res.json({
          projects: pmProjects,
          total: pmProjects.length,
          page: 1,
          limit: pmProjects.length,
          totalPages: 1
        });
      }

      // For general requests, return mock data with cross-RDC support
      const mockProjects: Project[] = [
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
          updatedAt: '2024-01-15T00:00:00Z'
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
          updatedAt: '2024-02-10T00:00:00Z'
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
            { id: 'pj-3', projectId: 'proj-6', jurisdictionId: 'region-10', relationshipType: 'secondary', createdAt: '2024-01-01T00:00:00Z' }
          ],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
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
            { id: 'pj-6', projectId: 'proj-7', jurisdictionId: 'region-4', relationshipType: 'secondary', createdAt: '2024-02-01T00:00:00Z' }
          ],
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-15T00:00:00Z'
        },
        // Projects assigned to PM (user-6: Patricia Martinez)
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
          assignedTo: 'user-6', // Patricia Martinez (PM)
          assignedAt: '2024-02-20T00:00:00Z',
          isPublic: true,
          createdAt: '2024-02-15T00:00:00Z',
          updatedAt: '2024-03-05T00:00:00Z'
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
          assignedTo: 'user-6', // Patricia Martinez (PM)
          assignedAt: '2024-03-01T00:00:00Z',
          isPublic: true,
          createdAt: '2024-02-28T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z'
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
          assignedTo: 'user-6', // Patricia Martinez (PM)
          assignedAt: '2024-01-10T00:00:00Z',
          isPublic: true,
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-05-10T00:00:00Z'
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
          status: 'initiate', // New status for RDC management assignment to PM
          progressPercentage: 0,
          createdBy: 'admin-1',
          assignedTo: 'user-6', // Patricia Martinez (PM)
          assignedAt: '2024-06-20T00:00:00Z',
          isPublic: true,
          createdAt: '2024-06-15T00:00:00Z',
          updatedAt: '2024-06-20T00:00:00Z'
        }
      ];

      // Apply filters to mock data
      let filteredProjects = mockProjects;

      // Filter by jurisdiction IDs
      if (filters.jurisdictionId && filters.jurisdictionId.length > 0) {
        filteredProjects = filteredProjects.filter(project => {
          // Check primary jurisdiction
          if (filters.jurisdictionId!.includes(project.jurisdictionId)) {
            return true;
          }
          // Check cross-RDC jurisdictions
          if (project.jurisdictions) {
            return project.jurisdictions.some(pj => 
              filters.jurisdictionId!.includes(pj.jurisdictionId)
            );
          }
          return false;
        });
      }

      // Filter by status
      if (filters.status) {
        filteredProjects = filteredProjects.filter(project => 
          project.status === filters.status
        );
      }

      // Filter by category
      if (filters.category) {
        filteredProjects = filteredProjects.filter(project => 
          project.category === filters.category
        );
      }

      // Filter by priority
      if (filters.priority) {
        filteredProjects = filteredProjects.filter(project => 
          project.priority === filters.priority
        );
      }

      // Filter by scope
      if (filters.scope) {
        filteredProjects = filteredProjects.filter(project => 
          project.scope === filters.scope
        );
      }

      // Filter by funding source
      if (filters.fundingSource) {
        filteredProjects = filteredProjects.filter(project => 
          project.fundingSource === filters.fundingSource
        );
      }

      // Filter by assigned PM
      if (filters.assignedTo) {
        filteredProjects = filteredProjects.filter(project => 
          project.assignedTo === filters.assignedTo
        );
      }

      // Filter by public visibility
      if (filters.isPublic !== undefined) {
        filteredProjects = filteredProjects.filter(project => 
          project.isPublic === filters.isPublic
        );
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm)
        );
      }

      const response: ProjectListResponse = {
        projects: filteredProjects,
        total: filteredProjects.length,
        page: filters.page || 1,
        limit: filters.limit || 20,
        totalPages: Math.ceil(filteredProjects.length / (filters.limit || 20))
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
      const { id } = req.params;
      
      // TODO: Implement database query
      // For now, return mock data based on project ID
      let mockProject: Project;
      
      if (id === 'proj-pm-1') {
        mockProject = {
          id: id,
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
          isPublic: true,
          createdAt: '2024-02-15T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
          projectManagerId: 'pm-001',
          assignedTo: 'user-6',
          status: 'in_progress',
          progressPercentage: 40
        };
      } else if (id === 'proj-pm-2') {
        mockProject = {
          id: id,
          code: 'RDC2-000002',
          jurisdictionId: 'region-2',
          name: 'Anna Regina Sports Complex',
          description: 'Construction of modern sports facility with multiple courts and recreational areas',
          category: 'recreation',
          priority: 'medium',
          scope: 'regional',
          fundingSource: 'national',
          budgetAllocated: 4500000,
          budgetSpent: 900000,
          currency: 'GYD',
          plannedStartDate: '2024-06-01',
          plannedEndDate: '2025-03-31',
          isPublic: true,
          createdAt: '2024-05-01T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
          projectManagerId: 'pm-001',
          assignedTo: 'user-6',
          status: 'in_progress',
          progressPercentage: 20
        };
      } else if (id === 'proj-pm-3') {
        mockProject = {
          id: id,
          code: 'RDC2-000003',
          jurisdictionId: 'region-2',
          name: 'Bartica Health Center Upgrade',
          description: 'Modernization of healthcare facilities and equipment in Bartica region',
          category: 'healthcare',
          priority: 'high',
          scope: 'regional',
          fundingSource: 'national',
          budgetAllocated: 2800000,
          budgetSpent: 560000,
          currency: 'GYD',
          plannedStartDate: '2024-08-01',
          plannedEndDate: '2025-02-28',
          isPublic: true,
          createdAt: '2024-07-01T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
          projectManagerId: 'pm-001',
          assignedTo: 'user-6',
          status: 'in_progress',
          progressPercentage: 20
        };
      } else if (id === 'proj-pm-4') {
        mockProject = {
          id: id,
          code: 'RDC2-000004',
          jurisdictionId: 'region-2',
          name: 'Anna Regina Sports Complex',
          description: 'Construction of modern sports complex with football field, basketball court, and community facilities in Anna Regina',
          category: 'infrastructure',
          priority: 'high',
          scope: 'local',
          fundingSource: 'regional',
          budgetAllocated: 7500000,
          budgetSpent: 1500000,
          currency: 'GYD',
          plannedStartDate: '2024-06-01',
          plannedEndDate: '2025-03-31',
          isPublic: true,
          createdAt: '2024-05-01T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
          projectManagerId: 'pm-001',
          assignedTo: 'user-6',
          status: 'in_progress',
          progressPercentage: 20
        };
      } else if (id === 'proj-pm-5') {
        mockProject = {
          id: id,
          code: 'RDC2-000005',
          jurisdictionId: 'region-2',
          name: 'Georgetown Water Treatment Plant',
          description: 'Construction of advanced water treatment facility for Georgetown and surrounding areas',
          category: 'infrastructure',
          priority: 'critical',
          scope: 'regional',
          fundingSource: 'national',
          budgetAllocated: 12000000,
          budgetSpent: 2400000,
          currency: 'GYD',
          plannedStartDate: '2024-04-01',
          plannedEndDate: '2025-12-31',
          isPublic: true,
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-10-15T10:30:00Z',
          projectManagerId: 'pm-001',
          assignedTo: 'user-6',
          status: 'in_progress',
          progressPercentage: 20
        };
      } else {
        // Default fallback project
        mockProject = {
          id: id,
          jurisdictionId: 'region-1',
          name: 'Project Not Found',
          description: 'The requested project could not be found',
          category: 'unknown',
          priority: 'medium',
          scope: 'unknown',
          fundingSource: 'unknown',
          budgetAllocated: 0,
          budgetSpent: 0,
          currency: 'GYD',
          plannedStartDate: '2024-01-01',
          plannedEndDate: '2024-06-30',
          actualStartDate: '2024-01-15',
          status: 'in_progress',
          progressPercentage: 65,
          createdBy: 'admin-1',
          isPublic: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        };
      }

      res.json(mockProject);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create new project
  app.post("/api/projects", requireAuth, requireStaff, async (req, res) => {
    try {
      const projectData: CreateProjectRequest = req.body;
      
      // TODO: Implement database insert
      // For now, return mock response
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        jurisdictionId: projectData.jurisdictionId,
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        priority: projectData.priority,
        scope: projectData.scope || 'local',
        fundingSource: projectData.fundingSource || 'local',
        budgetAllocated: projectData.budgetAllocated,
        budgetSpent: 0,
        currency: 'GYD',
        plannedStartDate: projectData.plannedStartDate,
        plannedEndDate: projectData.plannedEndDate,
        actualStartDate: projectData.actualStartDate,
        actualEndDate: projectData.actualEndDate,
        status: 'planning',
        progressPercentage: 0,
        projectManagerId: projectData.projectManagerId,
        createdBy: req.user?.id || 'unknown',
        isPublic: projectData.isPublic ?? true,
        publicDescription: projectData.publicDescription,
        jurisdictions: projectData.jurisdictions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(newProject);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Update project
  app.put("/api/projects/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData: UpdateProjectRequest = req.body;
      
      // TODO: Implement database update
      // For now, return mock response
      const updatedProject: Project = {
        id: id,
        jurisdictionId: 'region-1',
        name: 'Updated Project Name',
        description: 'Updated project description',
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
        updatedAt: new Date().toISOString(),
        ...updateData
      };

      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", requireAuth, requireStaff, async (req, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Implement database delete
      // For now, return success
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // PROJECT MILESTONES
  // =============================================
  
  app.get("/api/projects/:id/milestones", async (req, res) => {
    try {
      const { id } = req.params;
      
      // TODO: Implement database query
      const mockMilestones: ProjectMilestone[] = [
        {
          id: 'milestone-1',
          projectId: id,
          name: 'Site Survey Complete',
          description: 'Complete topographical survey and environmental assessment',
          dueDate: '2024-01-31',
          status: 'completed',
          progressPercentage: 100,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-31T00:00:00Z'
        },
        {
          id: 'milestone-2',
          projectId: id,
          name: 'Phase 1 Construction',
          description: 'Complete first 2km of road repairs',
          dueDate: '2024-04-30',
          status: 'in_progress',
          progressPercentage: 80,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ];

      res.json(mockMilestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // PUBLIC PROJECT DASHBOARD
  // =============================================
  
  app.get("/api/projects/public", async (req, res) => {
    try {
      const jurisdictionId = req.query.jurisdictionId as string;
      
      // TODO: Implement database query for public projects
      const mockPublicProjects: Project[] = [
        {
          id: 'proj-1',
          jurisdictionId: jurisdictionId || 'region-1',
          name: 'Mabaruma Road Repairs',
          description: 'Repair and upgrade main roads in Mabaruma area',
          category: 'infrastructure',
          priority: 'high',
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
          updatedAt: '2024-01-15T00:00:00Z'
        }
      ];

      res.json(mockPublicProjects);
    } catch (error) {
      console.error("Error fetching public projects:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // =============================================
  // PROJECT SUMMARY & REPORTS
  // =============================================
  
  app.get("/api/projects/reports/summary", requireAuth, requireStaff, async (req, res) => {
    try {
      const jurisdictionId = req.query.jurisdictionId as string;
      
      // TODO: Implement database aggregation
      const mockSummary: ProjectSummary = {
        totalProjects: 15,
        activeProjects: 8,
        completedProjects: 5,
        totalBudget: 15000000,
        totalSpent: 8500000,
        averageProgress: 65,
        overdueProjects: 2,
        projectsByCategory: {
          infrastructure: 8,
          health: 3,
          education: 2,
          agriculture: 2
        },
        projectsByStatus: {
          planning: 2,
          approved: 3,
          in_progress: 8,
          completed: 5,
          on_hold: 1
        }
      };

      res.json(mockSummary);
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
      const { id } = req.params;
      
      // TODO: Implement database query
      const mockUpdates: ProjectCitizenUpdate[] = [
        {
          id: 'update-1',
          projectId: id,
          title: 'Road Construction Progress Update',
          content: 'We are pleased to report that Phase 1 of the Mabaruma Road Repairs is 80% complete.',
          updateType: 'progress',
          isPublic: true,
          createdBy: 'admin-1',
          createdAt: '2024-01-15T00:00:00Z'
        }
      ];

      res.json(mockUpdates);
    } catch (error) {
      console.error("Error fetching project updates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/projects/:id/feedback", async (req, res) => {
    try {
      const { id } = req.params;
      const feedbackData = req.body;
      
      // TODO: Implement database insert
      const newFeedback: ProjectFeedback = {
        id: `feedback-${Date.now()}`,
        projectId: id,
        citizenId: feedbackData.citizenId,
        feedbackType: feedbackData.feedbackType,
        title: feedbackData.title,
        content: feedbackData.content,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.status(201).json(newFeedback);
    } catch (error) {
      console.error("Error creating project feedback:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });
}
