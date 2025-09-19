// Fresh API file to force browser reload
export interface ProjectSchedule {
  id: string;
  projectId: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  version: number;
  isCurrent: boolean;
  totalDurationDays: number;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  selectedPhases?: string[];
  selectedDocuments?: string[];
}

export interface ScheduleTask {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  estimatedHours: number;
  actualHours: number;
  assignedTo: string | null;
  parentTaskId: string | null;
  dependencies: string[];
  subtasks: ScheduleTask[];
}

// Get current schedule for a project - FRESH VERSION
export const getCurrentScheduleFresh = async (projectId: string): Promise<ProjectSchedule | null> => {
  console.log('🔍 getCurrentScheduleFresh called - FRESH FILE - VERSION 8 - FORCE RELOAD');
  const response = await fetch(`/api/projects/${projectId}/schedules/current?t=${Date.now()}&v=8&fresh=true&force=true&reload=true`, {
    credentials: 'include',
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
  
  console.log('📡 Response status:', response.status);
  
  if (response.status === 404) {
    // No schedule exists - this is normal for blank projects
    console.log('✅ No schedule found - returning null (this is normal)');
    return null;
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch current schedule');
  }
  
  return response.json();
};

// Create new schedule from template
export const createSchedule = async (projectId: string, scheduleData: {
  templateId: string;
  name: string;
  description: string;
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
    credentials: 'include',
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update schedule');
  }

  return response.json();
};

// Add phases to schedule
export const addPhasesToSchedule = async (projectId: string, scheduleId: string, phaseData: any): Promise<void> => {
  const response = await fetch(`/api/schedules/${scheduleId}/phases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(phaseData),
  });

  if (!response.ok) {
    throw new Error('Failed to add phases to schedule');
  }
};

// Save bulk tasks
export const saveBulkTasks = async (scheduleId: string, tasks: ScheduleTask[]): Promise<void> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ tasks }),
  });

  if (!response.ok) {
    throw new Error('Failed to save bulk tasks');
  }
};

// Get schedule tasks
export const getScheduleTasks = async (scheduleId: string): Promise<ScheduleTask[]> => {
  const response = await fetch(`/api/schedules/${scheduleId}/tasks`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedule tasks');
  }

  return response.json();
};

// Update task
export const updateTask = async (taskId: string, updateData: Partial<ScheduleTask>): Promise<ScheduleTask> => {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
};

// Add subtask
export const addSubtask = async (parentTaskId: string, subtaskData: Partial<ScheduleTask>): Promise<ScheduleTask> => {
  const response = await fetch(`/api/tasks/${parentTaskId}/subtasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(subtaskData),
  });

  if (!response.ok) {
    throw new Error('Failed to add subtask');
  }

  return response.json();
};

// Get schedule templates
export const getScheduleTemplates = async (): Promise<any[]> => {
  const response = await fetch('/api/schedule-templates', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedule templates');
  }

  return response.json();
};

// Get PM checklist templates
export const getPMChecklistTemplates = async (): Promise<any[]> => {
  const response = await fetch('/api/pm-checklist-templates', {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch PM checklist templates');
  }

  return response.json();
};

// Get checklist for task type
export const getChecklistForTaskType = async (taskType: string): Promise<any[]> => {
  const response = await fetch(`/api/checklists/${taskType}`, {
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch checklist for task type');
  }

  return response.json();
};
