// Project Tracker Module Types
// Standalone module that can be integrated with main Guyana Civic platform

export interface Project {
  id: string;
  code?: string; // Project code (e.g., RDC1-000001)
  jurisdictionId: string; // Primary jurisdiction (for backward compatibility)
  name: string;
  description: string;
  category: 'infrastructure' | 'health' | 'education' | 'agriculture' | 'environment' | 'social' | 'economic';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Project Scope & Funding
  scope: 'local' | 'regional' | 'national';
  fundingSource: 'local' | 'regional' | 'national' | 'international';
  
  // Budget Management
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  
  // Timeline
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Status & Progress
  status: 'submitted' | 'under_review' | 'approved' | 'assigned' | 'initiate' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progressPercentage: number;
  
  // Team Management
  projectManagerId?: string;
  assignedTo?: string; // PM user ID when assigned
  assignedAt?: string; // Assignment date
  createdBy: string;
  
  // Public Engagement
  isPublic: boolean;
  publicDescription?: string;
  
  // Cross-RDC Support
  jurisdictions?: ProjectJurisdiction[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ProjectJurisdiction {
  id: string;
  projectId: string;
  jurisdictionId: string;
  relationshipType: 'primary' | 'secondary' | 'affected';
  createdAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTeamMember {
  id: string;
  projectId: string;
  employeeId: string;
  role: 'manager' | 'coordinator' | 'supervisor' | 'worker';
  assignedDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProjectContractor {
  id: string;
  projectId: string;
  name: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  contractAmount?: number;
  contractStartDate?: string;
  contractEndDate?: string;
  status: 'pending' | 'active' | 'completed' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBudgetCategory {
  id: string;
  projectId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCitizenUpdate {
  id: string;
  projectId: string;
  title: string;
  content: string;
  updateType: 'progress' | 'milestone' | 'delay' | 'completion' | 'general';
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
}

export interface ProjectFeedback {
  id: string;
  projectId: string;
  citizenId?: string;
  feedbackType: 'complaint' | 'suggestion' | 'praise' | 'question';
  title: string;
  content: string;
  status: 'new' | 'acknowledged' | 'in_review' | 'resolved' | 'closed';
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  documentName: string;
  documentType: 'contract' | 'permit' | 'report' | 'photo' | 'other';
  filePath: string;
  fileSize?: number;
  uploadedBy: string;
  isPublic: boolean;
  createdAt: string;
}

export interface ProjectIssue {
  id: string;
  projectId: string;
  issueId?: string; // Links to main issues table
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Request/Response Types
export interface CreateProjectRequest {
  jurisdictionId: string; // Primary jurisdiction
  name: string;
  description: string;
  category: Project['category'];
  priority: Project['priority'];
  scope: Project['scope'];
  fundingSource: Project['fundingSource'];
  budgetAllocated: number;
  plannedStartDate: string;
  plannedEndDate: string;
  projectManagerId?: string;
  isPublic?: boolean;
  publicDescription?: string;
  jurisdictions?: Array<{
    jurisdictionId: string;
    relationshipType: 'primary' | 'secondary' | 'affected';
  }>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  category?: Project['category'];
  priority?: Project['priority'];
  budgetAllocated?: number;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status?: Project['status'];
  progressPercentage?: number;
  projectManagerId?: string;
  isPublic?: boolean;
  publicDescription?: string;
}

export interface ProjectFilters {
  jurisdictionId?: string | string[]; // Support multiple jurisdictions
  status?: Project['status'];
  category?: Project['category'];
  priority?: Project['priority'];
  scope?: Project['scope'];
  fundingSource?: Project['fundingSource'];
  relationshipType?: 'primary' | 'secondary' | 'affected';
  projectManagerId?: string;
  assignedTo?: string; // Filter by assigned PM
  isPublic?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'progressPercentage' | 'budgetAllocated';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  overdueProjects: number;
  projectsByCategory: Record<string, number>;
  projectsByStatus: Record<string, number>;
}

// Integration Events (for communication with main app)
export interface ProjectEvent {
  type: 'project.created' | 'project.updated' | 'project.completed' | 'project.delayed' | 'budget.exceeded' | 'milestone.completed';
  projectId: string;
  jurisdictionId: string;
  data: any;
  timestamp: string;
}

// Module Configuration
export interface ProjectTrackerConfig {
  moduleId: 'project-tracker';
  version: string;
  isEnabled: boolean;
  features: {
    publicDashboard: boolean;
    citizenUpdates: boolean;
    budgetTracking: boolean;
    documentManagement: boolean;
    contractorManagement: boolean;
    milestoneTracking: boolean;
  };
  permissions: {
    canCreateProjects: string[];
    canEditProjects: string[];
    canViewAllProjects: string[];
    canManageBudget: string[];
  };
}
