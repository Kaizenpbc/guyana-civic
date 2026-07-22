// PM Application API - Points to standalone PM Application
const PM_APP_BASE_URL = 'http://localhost:3001';

export interface ProjectSchedule {
  id: string;
  project_id: string;
  name: string;
  description: string;
  template_id?: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  version: number;
  is_current: boolean;
  total_duration_days: number;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  selectedPhases?: any[];
  selectedDocuments?: any[];
}

export interface ScheduleTask {
  id: string;
  schedule_id?: string;
  parent_task_id?: string;
  name: string;
  description?: string;
  type?: 'phase' | 'summary' | 'task' | 'milestone' | 'document';
  status: string;
  priority?: string;
  start_date?: string;
  end_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  progress_percentage?: number;
  assigned_to?: string;
  dependencies?: string[];
  // camelCase aliases used throughout the application
  parentTaskId?: string | null;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string | null;
  progress?: number;
  subtasks?: ScheduleTask[];
  // Additional fields used in project views
  taskType?: string;
  estimatedDays?: number;
  dependency?: string;
  actualStartDate?: string;
  projectedFinishDate?: string;
  workEffort?: string;
  assignedResource?: string;
  risks?: string;
  issues?: string;
  comments?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  icon?: string;
  estimated_duration: string;
  phases: Array<{
    id: string;
    name: string;
    description: string;
    estimated_days: number;
    tasks: Array<{
      name: string;
      description: string;
      estimated_hours: number;
    }>;
  }>;
  documents: Array<{
    id: string;
    name: string;
    description: string;
    required: boolean;
  }>;
}

// Get current schedule for a project from PM Application
export const getCurrentSchedule = async (projectId: string): Promise<ProjectSchedule | null> => {
  console.log('🔍 getCurrentSchedule called - PM Application API');
  
  try {
    const response = await fetch(`${PM_APP_BASE_URL}/api/schedules/projects/${projectId}/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 PM Application response status:', response.status);
    
    if (response.status === 404) {
      console.log('✅ No schedule found in PM Application - returning null');
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`PM Application error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 PM Application schedule data:', data);
    return data.schedule;
  } catch (error) {
    console.error('❌ Error fetching schedule from PM Application:', error);
    throw error;
  }
};

// Create new schedule in PM Application
export const createSchedule = async (projectId: string, scheduleData: {
  name: string;
  description: string;
  templateId?: string;
}): Promise<ProjectSchedule> => {
  console.log('📝 Creating schedule in PM Application:', scheduleData);
  
  const response = await fetch(`${PM_APP_BASE_URL}/api/schedules/projects/${projectId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: scheduleData.name,
      description: scheduleData.description,
      templateId: scheduleData.templateId,
      status: 'draft',
      version: 1,
      isCurrent: true,
      totalDurationDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      progressPercentage: 0
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create schedule in PM Application: ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Schedule created in PM Application:', data);
  return data.schedule;
};

// Update schedule in PM Application
export const updateSchedule = async (projectId: string, scheduleId: string, updateData: Partial<ProjectSchedule>): Promise<ProjectSchedule> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/schedules/${scheduleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update schedule in PM Application');
  }

  const data = await response.json();
  return data.schedule;
};

// Save bulk tasks to PM Application
export const saveBulkTasks = async (scheduleId: string, tasks: ScheduleTask[]): Promise<void> => {
  console.log('💾 Saving bulk tasks to PM Application:', tasks.length, 'tasks');
  
  const response = await fetch(`${PM_APP_BASE_URL}/api/tasks/schedules/${scheduleId}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save tasks to PM Application: ${errorText}`);
  }

  console.log('✅ Tasks saved to PM Application successfully');
};

// Get schedule tasks from PM Application
export const getScheduleTasks = async (scheduleId: string): Promise<ScheduleTask[]> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/tasks/schedules/${scheduleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks from PM Application');
  }

  const data = await response.json();
  return data.tasks || [];
};

// Update task in PM Application
export const updateTask = async (taskId: string, updateData: Partial<ScheduleTask>): Promise<ScheduleTask> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update task in PM Application');
  }

  const data = await response.json();
  return data.task;
};

// Get schedule templates from PM Application
export const getScheduleTemplates = async (): Promise<ScheduleTemplate[]> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/templates/schedules`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch templates from PM Application');
  }

  const data = await response.json();
  return data.templates || [];
};

// Get PM checklist templates from PM Application
export const getPMChecklistTemplates = async (): Promise<any[]> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/templates/checklists`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch checklist templates from PM Application');
  }

  const data = await response.json();
  return data.templates || [];
};

// Get checklist for task type from PM Application
export const getChecklistForTaskType = async (taskType: string): Promise<any[]> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/templates/checklists/task-type/${taskType}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch checklist for task type from PM Application');
  }

  const data = await response.json();
  return data.template || [];
};

// Clear schedule from PM Application
export const clearSchedule = async (projectId: string): Promise<void> => {
  const response = await fetch(`${PM_APP_BASE_URL}/api/schedules/projects/${projectId}/current`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to clear schedule in PM Application');
  }
};

