// PM Tool API functions for persistent schedule management

export interface ProjectSchedule {
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

export interface SchedulePhase {
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

export interface ScheduleTask {
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

export interface ScheduleTemplate {
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

export interface PMChecklistTemplate {
  id: string;
  taskType: string;
  taskKeywords: string[];
  checklistItems: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Functions

// Get all schedules for a project
export const getProjectSchedules = async (projectId: string): Promise<ProjectSchedule[]> => {
  const response = await fetch(`/api/projects/${projectId}/schedules`);
  if (!response.ok) {
    throw new Error('Failed to fetch project schedules');
  }
  return response.json();
};

// Get current schedule for a project
export const getCurrentSchedule = async (projectId: string): Promise<ProjectSchedule> => {
  const response = await fetch(`/api/projects/${projectId}/schedules/current`);
  if (!response.ok) {
    throw new Error('Failed to fetch current schedule');
  }
  return response.json();
};

// Create new schedule from template
export const createSchedule = async (projectId: string, scheduleData: {
  templateId: string;
  name: string;
  description?: string;
  selectedPhases?: any[];
  selectedDocuments?: any[];
}): Promise<ProjectSchedule> => {
  const response = await fetch(`/api/projects/${projectId}/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(scheduleData),
  });
  if (!response.ok) {
    throw new Error('Failed to create schedule');
  }
  return response.json();
};

// Update schedule
export const updateSchedule = async (projectId: string, scheduleId: string, updateData: Partial<ProjectSchedule>): Promise<ProjectSchedule> => {
  const response = await fetch(`/api/projects/${projectId}/schedules/${scheduleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update schedule');
  }
  return response.json();
};

export const addPhasesToSchedule = async (projectId: string, scheduleId: string, phaseData: {
  selectedPhases: any[];
  selectedDocuments: any[];
  currentSchedule?: any;
}): Promise<ProjectSchedule> => {
  const response = await fetch(`/api/projects/${projectId}/schedules/${scheduleId}/phases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(phaseData),
  });
  if (!response.ok) {
    throw new Error('Failed to add phases to schedule');
  }
  return response.json();
};

export const saveBulkTasks = async (scheduleId: string, tasks: ScheduleTask[]): Promise<any> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
  });
  if (!response.ok) {
    throw new Error('Failed to save tasks');
  }
  return response.json();
};

// Get phases for a schedule
export const getSchedulePhases = async (scheduleId: string): Promise<SchedulePhase[]> => {
  const response = await fetch(`/api/schedules/${scheduleId}/phases`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule phases');
  }
  return response.json();
};

// Get tasks for a schedule
export const getScheduleTasks = async (scheduleId: string): Promise<ScheduleTask[]> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule tasks');
  }
  return response.json();
};

// Update task
export const updateTask = async (scheduleId: string, taskId: string, updateData: Partial<ScheduleTask>): Promise<ScheduleTask> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

// Add subtask
export const addSubtask = async (scheduleId: string, parentTaskId: string, subtaskData: {
  name: string;
  description?: string;
  estimatedHours?: number;
}): Promise<ScheduleTask> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks/${parentTaskId}/subtasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subtaskData),
  });
  if (!response.ok) {
    throw new Error('Failed to add subtask');
  }
  return response.json();
};

// Get all available templates
export const getScheduleTemplates = async (): Promise<ScheduleTemplate[]> => {
  const response = await fetch('/api/schedule-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch schedule templates');
  }
  return response.json();
};

// Get PM checklist templates
export const getPMChecklistTemplates = async (): Promise<PMChecklistTemplate[]> => {
  const response = await fetch('/api/pm-checklist-templates');
  if (!response.ok) {
    throw new Error('Failed to fetch PM checklist templates');
  }
  return response.json();
};

// Get checklist for specific task type
export const getChecklistForTaskType = async (taskType: string): Promise<PMChecklistTemplate> => {
  const response = await fetch(`/api/pm-checklist-templates/${taskType}`);
  if (!response.ok) {
    throw new Error('Failed to fetch checklist template');
  }
  return response.json();
};

// Get schedule change history
export const getScheduleHistory = async (scheduleId: string): Promise<any[]> => {
  const response = await fetch(`/api/schedules/${scheduleId}/history`);
  if (!response.ok) {
    throw new Error('Failed to fetch schedule history');
  }
  return response.json();
};
