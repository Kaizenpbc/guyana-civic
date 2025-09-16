import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Briefcase, MapPin, LayoutDashboard, Users, CalendarCheck, DollarSign, ClipboardList, TrendingUp, AlertCircle, CheckCircle, Calendar, FileText, ChevronRight, ChevronDown, Plus, Minus, CheckSquare, Square, Lightbulb, AlertTriangle, Save, Loader2, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LogoutButton from '@/components/LogoutButton';
import ProjectTable from '@/components/ProjectTable';
import ActiveProjectsCard from '@/components/ActiveProjectsCard';
import ProjectPlanningTemplates from '@/components/ProjectPlanningTemplates';
import { 
  getCurrentSchedule, 
  createSchedule, 
  updateSchedule, 
  addPhasesToSchedule,
  saveBulkTasks,
  getScheduleTasks, 
  updateTask, 
  addSubtask,
  getScheduleTemplates,
  getPMChecklistTemplates,
  getChecklistForTaskType,
  type ProjectSchedule,
  type ScheduleTask,
  type ScheduleTemplate,
  type PMChecklistTemplate
} from '@/api/pm-tool-api';
import { 
  getProjectRisks,
  getProjectIssues,
  getProjectDecisions,
  getProjectActions,
  type ProjectRisk,
  type ProjectIssue,
  type ProjectDecision,
  type ProjectAction
} from '@/api/risk-management-api';
import RiskManagementForms from '@/components/RiskManagementForms';
import RAIDDashboard from '@/components/RAIDDashboard';

// API function to get current user
const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
};

// API function to get PM's assigned projects
const getPMProjects = async (pmUserId: string): Promise<{ projects: any[], total: number, page: number, limit: number, totalPages: number }> => {
  const response = await fetch(`/api/projects?assignedTo=${pmUserId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};

const PMDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);
  const [editableDates, setEditableDates] = useState<{[key: string]: {baseStart?: string, baseFinish?: string, actualStart?: string, projectedFinish?: string}}>({});
  const [expandedTasks, setExpandedTasks] = useState<{[key: string]: boolean}>({});
  const [taskHierarchy, setTaskHierarchy] = useState<{[key: string]: any[]}>({});
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [checklistItems, setChecklistItems] = useState<{[key: string]: any[]}>({});
  const [showChecklistPanel, setShowChecklistPanel] = useState(false);
  
  // New state for persistent schedule management
  const [currentSchedule, setCurrentSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Risk Management state
  const [showRiskManagement, setShowRiskManagement] = useState(false);
  const [selectedProjectForRisk, setSelectedProjectForRisk] = useState<any>(null);
  const [showRAIDDashboard, setShowRAIDDashboard] = useState(false);
  const [selectedProjectForRAID, setSelectedProjectForRAID] = useState<any>(null);
  
  const { data: authData, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const user = authData?.user || { id: 'user-6', fullName: 'Project Manager', role: 'pm', email: 'pm@city.gov', username: 'PM' }; // Fallback for testing

  // Fetch PM's assigned projects - moved before conditional returns
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects', 'pm', user.id],
    queryFn: () => getPMProjects(user.id),
    enabled: !!user.id
  });

  // Handle projects data when it changes
  useEffect(() => {
    if (projectsData) {
      console.log('PM Projects loaded:', projectsData);
      if (projectsData?.projects) {
        console.log('Projects count:', projectsData.projects.length);
        projectsData.projects.forEach((project: any) => {
          console.log(`Project ${project.id}: ${project.name} - Status: ${project.status}`);
        });
      }
    }
  }, [projectsData]);

  // Fetch current schedule when a project is selected
  const { data: scheduleData, isLoading: scheduleLoading, error: scheduleError } = useQuery({
    queryKey: ['schedule', 'current', selectedProject?.id],
    queryFn: () => {
      console.log('Fetching schedule for project:', selectedProject?.id);
      return getCurrentSchedule(selectedProject!.id);
    },
    enabled: !!selectedProject?.id
  });

  // Handle schedule data when it changes
  useEffect(() => {
    if (scheduleData) {
      console.log('🎉 Schedule data received!', scheduleData);
      console.log('Schedule loaded successfully:', scheduleData);
      console.log('Schedule selectedPhases:', scheduleData.selectedPhases);
      console.log('Schedule totalTasks:', scheduleData.totalTasks);
      setCurrentSchedule(scheduleData);
      
      // For existing schedules, show the schedule editor immediately
      // Don't show the success screen - go straight to schedule editing
      console.log('Setting showScheduleEditor to true for existing schedule');
      setShowScheduleEditor(true);
      
      // Preserve the template selection data from the saved schedule
      setGeneratedTemplate({
        project: selectedProject,
        template: { 
          name: scheduleData.templateName || 'Existing Schedule', 
          id: scheduleData.templateId || 'existing' 
        },
        selectedPhases: scheduleData.selectedPhases || [],
        selectedDocuments: scheduleData.selectedDocuments || []
      });
    } else if (scheduleError) {
      console.error('Error loading schedule:', scheduleError);
      // If no schedule exists, show template selection for initiate projects
      if (selectedProject?.status === 'initiate') {
        setShowTemplates(true);
      }
    }
  }, [scheduleData, scheduleError, selectedProject]);

  // Fetch schedule tasks when we have a current schedule
  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['schedule', 'tasks', currentSchedule?.id],
    queryFn: () => getScheduleTasks(currentSchedule!.id),
    enabled: !!currentSchedule?.id
  });

  // Handle tasks data when it changes
  useEffect(() => {
    if (tasksData) {
      console.log('Schedule tasks loaded successfully:', tasksData);
      console.log('Number of tasks loaded:', tasksData.length);
      setScheduleTasks(tasksData);
      // Initialize task hierarchy from fetched tasks
      const hierarchy: {[key: string]: any[]} = {};
      tasksData.forEach((task: any) => {
        if (task.isSubtask && task.parentTaskId) {
          if (!hierarchy[task.parentTaskId]) {
            hierarchy[task.parentTaskId] = [];
          }
          hierarchy[task.parentTaskId].push(task);
        }
      });
      setTaskHierarchy(hierarchy);
      console.log('Task hierarchy initialized:', hierarchy);
    }
  }, [tasksData]);

  // Handle tasks error
  useEffect(() => {
    if (tasksError) {
      console.error('Error loading schedule tasks:', tasksError);
    }
  }, [tasksError]);

  const handleProjectClick = (project: any) => {
    console.log('Project clicked:', project);
    console.log('Setting selectedProject to:', project.id);
    setSelectedProject(project);
    
    // Always try to load existing schedule first
    setShowTemplates(false);
    setShowSuccess(false);
    console.log('Reset showTemplates and showSuccess to false');
    
    // Check if we already have schedule data for this project
    console.log('Checking for existing schedule data:', { scheduleData, projectId: project.id, scheduleProjectId: scheduleData?.projectId });
    if (scheduleData && scheduleData.projectId === project.id) {
      console.log('Found existing schedule data, setting showSuccess to true');
      setCurrentSchedule(scheduleData);
      setShowSuccess(true);
      setGeneratedTemplate({
        project: project,
        template: { name: 'Existing Schedule', id: 'existing' },
        selectedPhases: [],
        selectedDocuments: []
      });
    } else {
      console.log('No existing schedule data found for this project');
    }
    // The useQuery for getCurrentSchedule will automatically load the schedule
    // and the useQuery for getScheduleTasks will load the tasks
  };

  const handleRiskManagementClick = (project: any) => {
    console.log('Risk Management clicked for project:', project);
    setSelectedProjectForRisk(project);
    setShowRiskManagement(true);
  };

  const handleRiskManagementClose = () => {
    setShowRiskManagement(false);
    setSelectedProjectForRisk(null);
  };

  const handleRiskManagementSuccess = () => {
    // Refresh data after successful creation
    queryClient.invalidateQueries({ queryKey: ['projects', 'pm', user.id] });
  };

  // RAID Dashboard handlers
  const handleViewRAID = (project: any) => {
    setSelectedProjectForRAID(project);
    setShowRAIDDashboard(true);
  };

  const handleRAIDDashboardClose = () => {
    setShowRAIDDashboard(false);
    setSelectedProjectForRAID(null);
  };

  const handleRAIDAddNew = (type: 'risk' | 'issue' | 'decision' | 'action') => {
    // Close RAID dashboard and open the appropriate form
    setShowRAIDDashboard(false);
    setSelectedProjectForRisk(selectedProjectForRAID);
    setShowRiskManagement(true);
    // TODO: Set the active tab in RiskManagementForms to the correct type
  };


  // Debug React Query state
  console.log('React Query State:', {
    selectedProject: selectedProject?.id,
    scheduleLoading,
    scheduleError,
    scheduleData,
    currentSchedule: currentSchedule?.id,
    tasksLoading,
    tasksError,
    tasksData,
    showSuccess,
    showTemplates,
    generatedTemplate: !!generatedTemplate
  });


  // Mutation for creating a new schedule
  const createScheduleMutation = useMutation({
    mutationFn: (template: any) => createSchedule(selectedProject.id, {
      templateId: template.id,
      name: `${selectedProject.name} - Schedule`,
      description: `Project schedule generated from ${template.name} template`,
      selectedPhases: template.selectedPhases || [],
      selectedDocuments: template.selectedDocuments || []
    }),
    onSuccess: (newSchedule) => {
      setCurrentSchedule(newSchedule);
      queryClient.invalidateQueries({ queryKey: ['schedule', 'current', selectedProject.id] });
    }
  });

  // Mutation for updating a schedule
  const updateScheduleMutation = useMutation({
    mutationFn: (updateData: Partial<ProjectSchedule>) => 
      updateSchedule(selectedProject!.id, currentSchedule!.id, updateData),
    onSuccess: (updatedSchedule) => {
      setCurrentSchedule(updatedSchedule);
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['schedule', 'current', selectedProject!.id] });
    }
  });

  // Mutation for updating a task
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updateData }: { taskId: string, updateData: Partial<ScheduleTask> }) => 
      updateTask(currentSchedule!.id, taskId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'tasks', currentSchedule!.id] });
    }
  });

  // Mutation for adding a subtask
  const addSubtaskMutation = useMutation({
    mutationFn: ({ parentTaskId, subtaskData }: { parentTaskId: string, subtaskData: any }) => {
      if (!currentSchedule) throw new Error('No current schedule');
      return addSubtask(currentSchedule.id, parentTaskId, subtaskData);
    },
    onSuccess: () => {
      setHasUnsavedChanges(true);
      if (currentSchedule) {
        queryClient.invalidateQueries({ queryKey: ['schedule', 'tasks', currentSchedule.id] });
      }
    }
  });

  const handleTemplateSelect = async (template: any) => {
    console.log('Selected template:', template);
    console.log('For project:', selectedProject);
    
    try {
      if (currentSchedule) {
        // Adding phases to existing schedule
        console.log('Adding phases to existing schedule');
        
        // Merge phases locally (simpler approach)
        console.log('Merging phases locally...');
        
        // Merge the new phases with existing ones, avoiding duplicates
        const existingPhaseIds = (currentSchedule.selectedPhases || []).map((p: any) => p.id);
        const newPhases = template.selectedPhases.filter((phase: any) => !existingPhaseIds.includes(phase.id));
        const updatedPhases = [
          ...(currentSchedule.selectedPhases || []),
          ...newPhases
        ];
        const updatedDocuments = [
          ...(currentSchedule.selectedDocuments || []),
          ...template.selectedDocuments
        ];
        
        // Create new tasks from the added phases (only new ones)
        const newTasks: ScheduleTask[] = [];
        newPhases.forEach((phase: any, phaseIndex: number) => {
          const phaseId = `phase-${currentSchedule.id}-${Date.now()}-${phaseIndex}`;
          phase.tasks?.forEach((task: any, taskIndex: number) => {
            const taskId = `task-${currentSchedule.id}-${Date.now()}-${taskIndex}`;
            newTasks.push({
              id: taskId,
              scheduleId: currentSchedule.id,
              phaseId: phaseId,
              taskOrder: taskIndex + 1,
              level: 1,
              isSubtask: false,
              name: task.name,
              description: task.description,
              estimatedHours: task.estimatedHours,
              dependsOnTasks: [],
              assignedTo: 'pm-1',
              requiredSkills: task.requiredSkills || [],
              deliverables: task.deliverables || [],
              status: 'not_started',
              progressPercentage: 0,
              checklistItems: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
            
            // Add subtasks if they exist
            task.subtasks?.forEach((subtask: any, subtaskIndex: number) => {
              const subtaskId = `task-${currentSchedule.id}-${Date.now()}-${taskIndex}-${subtaskIndex}`;
              newTasks.push({
                id: subtaskId,
                scheduleId: currentSchedule.id,
                phaseId: phaseId,
                parentTaskId: taskId,
                taskOrder: subtaskIndex + 1,
                level: 2,
                isSubtask: true,
                name: subtask.name,
                description: subtask.description,
                estimatedHours: subtask.estimatedHours,
                dependsOnTasks: [],
                assignedTo: 'pm-1',
                requiredSkills: subtask.requiredSkills || [],
                deliverables: subtask.deliverables || [],
                status: 'not_started',
                progressPercentage: 0,
                checklistItems: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            });
          });
        });
        
        // Update the current schedule with merged phases
        const updatedSchedule = {
          ...currentSchedule,
          selectedPhases: updatedPhases,
          selectedDocuments: updatedDocuments,
          updatedAt: new Date().toISOString(),
          totalTasks: (currentSchedule.totalTasks || 0) + newTasks.length,
          totalDurationDays: (currentSchedule.totalDurationDays || 0) + template.selectedPhases.reduce((sum: number, phase: any) => sum + (phase.estimatedDays || 0), 0)
        };
        
        // Update both schedule and tasks state
        setCurrentSchedule(updatedSchedule);
        setScheduleTasks(prev => [...prev, ...newTasks]);
        
        // Close template selection and return to schedule editor
        setShowTemplates(false);
        setShowScheduleEditor(true);
        
        console.log('Phases added successfully locally');
        return;
      }
      
      // Create new schedule from template
      await createScheduleMutation.mutateAsync(template);
      
      // Initialize task hierarchy with pre-defined subtasks from template
      const initialTaskHierarchy: {[key: string]: any[]} = {};
      template.selectedPhases?.forEach((phase: any) => {
        phase.tasks?.forEach((task: any) => {
          if (task.subtasks && task.subtasks.length > 0) {
            initialTaskHierarchy[task.id] = task.subtasks.map((subtask: any) => ({
              ...subtask,
              isSubtask: true,
              parentTaskId: task.id
            }));
          }
        });
      });
      
      // Store the generated template data
      setGeneratedTemplate({
        project: selectedProject,
        template: template,
        selectedPhases: template.selectedPhases || [],
        selectedDocuments: template.selectedDocuments || []
      });
      
      // Set initial task hierarchy
      setTaskHierarchy(initialTaskHierarchy);
      
      // Show success screen
      setShowTemplates(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating schedule:', error);
      // Fallback to old behavior if API fails
      setGeneratedTemplate({
        project: selectedProject,
        template: template,
        selectedPhases: template.selectedPhases || [],
        selectedDocuments: template.selectedDocuments || []
      });
      setShowTemplates(false);
      setShowSuccess(true);
    }
  };

  const handleCloseTemplates = () => {
    setShowTemplates(false);
    setSelectedProject(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setShowScheduleEditor(false);
    setSelectedProject(null);
    setGeneratedTemplate(null);
    setTaskHierarchy({});
    setExpandedTasks({});
    setSelectedTask(null);
    setChecklistItems({});
    setShowChecklistPanel(false);
    setCurrentSchedule(null);
    setScheduleTasks([]);
    setHasUnsavedChanges(false);
  };

  // Save schedule function
  const handleSaveSchedule = async () => {
    console.log('Save button clicked!', { currentSchedule: !!currentSchedule, hasUnsavedChanges, editableDates });
    
    if (!currentSchedule) {
      console.log('No current schedule to save');
      return;
    }

    setIsSaving(true);
    try {
      // Save all task date changes
      const taskUpdates = Object.entries(editableDates).map(([taskId, dates]) => {
        const updateData: Partial<ScheduleTask> = {};
        
        if (dates.baseStart) updateData.plannedStartDate = dates.baseStart;
        if (dates.baseFinish) updateData.plannedEndDate = dates.baseFinish;
        if (dates.actualStart) updateData.actualStartDate = dates.actualStart;
        if (dates.projectedFinish) updateData.actualEndDate = dates.projectedFinish;
        
        return { taskId, updateData };
      });

      console.log('Task updates to save:', taskUpdates);

      // Update all tasks with their new dates
      await Promise.all(
        taskUpdates.map(({ taskId, updateData }) => 
          updateTaskMutation.mutateAsync({ taskId, updateData })
        )
      );

      // Save all tasks (including new ones from added phases)
      await saveBulkTasks(currentSchedule.id, scheduleTasks);

      // Update schedule metadata including new phases and tasks
      await updateScheduleMutation.mutateAsync({
        progressPercentage: currentSchedule.progressPercentage,
        totalTasks: scheduleTasks.length,
        completedTasks: scheduleTasks.filter(task => task.status === 'completed').length,
        selectedPhases: currentSchedule.selectedPhases,
        selectedDocuments: currentSchedule.selectedDocuments,
        totalDurationDays: currentSchedule.totalDurationDays
      });

      // Clear unsaved changes
      setHasUnsavedChanges(false);
      setEditableDates({});
      
      console.log('Schedule saved successfully!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Helper function to get date value for input
  const getDateValue = (taskId: string, field: string, defaultDate: Date): string => {
    const taskDates = editableDates[taskId];
    if (taskDates && taskDates[field as keyof typeof taskDates]) {
      return taskDates[field as keyof typeof taskDates]!;
    }
    return formatDateForInput(defaultDate);
  };

  // Handle date change
  const handleDateChange = (taskId: string, field: string, value: string) => {
    setEditableDates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Toggle task expansion
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Add subtask to a parent task
  const addSubtaskToTask = async (parentTaskId: string, phaseId: string) => {
    if (!currentSchedule) return;

    try {
      const subtaskData = {
        name: 'New Subtask',
        description: 'Click to edit description',
        estimatedHours: 4
      };

      await addSubtaskMutation.mutateAsync({ parentTaskId, subtaskData });

      // Auto-expand the parent task
      setExpandedTasks(prev => ({
        ...prev,
        [parentTaskId]: true
      }));
    } catch (error) {
      console.error('Error adding subtask:', error);
      // Fallback to local state if API fails
      const newSubtask = {
        id: `${parentTaskId}-sub-${Date.now()}`,
        name: 'New Subtask',
        description: 'Click to edit description',
        estimatedHours: 4,
        requiredSkills: ['TBD'],
        deliverables: ['TBD'],
        isSubtask: true,
        parentTaskId: parentTaskId
      };

      setTaskHierarchy(prev => ({
        ...prev,
        [parentTaskId]: [...(prev[parentTaskId] || []), newSubtask]
      }));

      setExpandedTasks(prev => ({
        ...prev,
        [parentTaskId]: true
      }));
    }
  };

  // Remove subtask
  const removeSubtask = (parentTaskId: string, subtaskId: string) => {
    setTaskHierarchy(prev => ({
      ...prev,
      [parentTaskId]: (prev[parentTaskId] || []).filter((subtask: any) => subtask.id !== subtaskId)
    }));
  };

  // Handle task selection for checklist
  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
    setShowChecklistPanel(true);
    
    // Initialize checklist items if not already set
    if (!checklistItems[task.id]) {
      const defaultChecklist = getDefaultChecklistForTask(task);
      setChecklistItems(prev => ({
        ...prev,
        [task.id]: defaultChecklist
      }));
    }
  };

  // Get default checklist items based on task type
  const getDefaultChecklistForTask = (task: any) => {
    const taskName = task.name.toLowerCase();
    
    if (taskName.includes('meeting') || taskName.includes('stakeholder')) {
      return [
        { id: '1', text: 'Send agenda 24 hours before meeting', completed: false, priority: 'critical' },
        { id: '2', text: 'Test projector/audio equipment', completed: false, priority: 'critical' },
        { id: '3', text: 'Prepare talking points and key messages', completed: false, priority: 'important' },
        { id: '4', text: 'Book meeting room or set up virtual link', completed: false, priority: 'critical' },
        { id: '5', text: 'Send reminder emails to attendees', completed: false, priority: 'important' },
        { id: '6', text: 'Prepare backup plan (recording, alternate host)', completed: false, priority: 'nice-to-have' }
      ];
    } else if (taskName.includes('survey') || taskName.includes('site')) {
      return [
        { id: '1', text: 'Check weather forecast for survey day', completed: false, priority: 'critical' },
        { id: '2', text: 'Verify equipment is charged and working', completed: false, priority: 'critical' },
        { id: '3', text: 'Confirm site access permissions', completed: false, priority: 'critical' },
        { id: '4', text: 'Review safety protocols and requirements', completed: false, priority: 'important' },
        { id: '5', text: 'Prepare backup equipment and tools', completed: false, priority: 'important' },
        { id: '6', text: 'Notify local authorities if required', completed: false, priority: 'nice-to-have' }
      ];
    } else if (taskName.includes('budget') || taskName.includes('cost')) {
      return [
        { id: '1', text: 'Review all funding sources and amounts', completed: false, priority: 'critical' },
        { id: '2', text: 'Verify cost breakdown accuracy', completed: false, priority: 'critical' },
        { id: '3', text: 'Check for any hidden or additional costs', completed: false, priority: 'important' },
        { id: '4', text: 'Prepare budget presentation materials', completed: false, priority: 'important' },
        { id: '5', text: 'Schedule approval meeting with authorities', completed: false, priority: 'critical' }
      ];
    } else if (taskName.includes('design') || taskName.includes('architectural')) {
      return [
        { id: '1', text: 'Review design requirements and specifications', completed: false, priority: 'critical' },
        { id: '2', text: 'Check compliance with local building codes', completed: false, priority: 'critical' },
        { id: '3', text: 'Verify accessibility requirements (ADA)', completed: false, priority: 'important' },
        { id: '4', text: 'Prepare design presentation materials', completed: false, priority: 'important' },
        { id: '5', text: 'Schedule design review meeting', completed: false, priority: 'important' }
      ];
    } else {
      return [
        { id: '1', text: 'Review task requirements and deliverables', completed: false, priority: 'critical' },
        { id: '2', text: 'Check resource availability and allocation', completed: false, priority: 'important' },
        { id: '3', text: 'Verify timeline and dependencies', completed: false, priority: 'important' },
        { id: '4', text: 'Prepare necessary documentation', completed: false, priority: 'nice-to-have' }
      ];
    }
  };

  // Toggle checklist item completion
  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [taskId]: prev[taskId].map((item: any) => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  // Add custom checklist item
  const addCustomChecklistItem = (taskId: string, text: string) => {
    const newItem = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      priority: 'custom'
    };
    
    setChecklistItems(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] || []), newItem]
    }));
  };

  // Temporary: Show the page even without auth for testing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Temporary: Don't redirect to login for testing
  // if (!authData?.user) {
  //   setLocation('/login');
  //   return null;
  // }

  if (showSuccess && generatedTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Schedule Generated!</h1>
            <Button variant="outline" onClick={handleCloseSuccess}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        {/* Success Content */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  Project Schedule Created Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Project Details</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Project:</strong> {generatedTemplate.project.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Template:</strong> {generatedTemplate.template.name}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Category:</strong> {generatedTemplate.project.category}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Duration:</strong> {generatedTemplate.template.estimatedDuration}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Generated Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Selected Phases:</strong> {generatedTemplate.selectedPhases.length}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Required Documents:</strong> {generatedTemplate.selectedDocuments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Total Tasks:</strong> {generatedTemplate.selectedPhases.reduce((total: number, phase: any) => total + phase.tasks.length, 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Project Timeline</h3>
                    {(() => {
                      const totalDays = generatedTemplate.selectedPhases.reduce((total: number, phase: any) => total + phase.estimatedDays, 0);
                      const startDate = new Date();
                      const endDate = new Date();
                      endDate.setDate(endDate.getDate() + totalDays - 1);
                      
                      return (
                        <>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Start Date:</strong> {startDate.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>End Date:</strong> {endDate.toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Total Duration:</strong> {totalDays} days
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Project Schedule Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Project Schedule
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete project timeline with tasks, dates, resources, and status tracking
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Task</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium w-[80px]">Dependency</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Base Start</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Base Finish</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Actual Start</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Projected Finish</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Work Effort</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Duration</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Resource</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Status</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Risks</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Issues</th>
                          <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedTemplate.selectedPhases.map((phase: any, phaseIndex: number) => {
                          // Calculate start date (assuming project starts today)
                          const projectStartDate = new Date();
                          const phaseStartDate = new Date(projectStartDate);
                          
                          // Add days from previous phases
                          let daysOffset = 0;
                          for (let i = 0; i < phaseIndex; i++) {
                            daysOffset += generatedTemplate.selectedPhases[i].estimatedDays;
                          }
                          phaseStartDate.setDate(phaseStartDate.getDate() + daysOffset);
                          
                          const phaseEndDate = new Date(phaseStartDate);
                          phaseEndDate.setDate(phaseEndDate.getDate() + phase.estimatedDays - 1);
                          
                          return (
                            <React.Fragment key={phase.id}>
                              {/* Phase Header Row */}
                              <tr className="bg-blue-50 dark:bg-blue-900/20">
                                <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 font-semibold text-blue-900 dark:text-blue-100" colSpan={13}>
                                  {phase.name} - {phase.description}
                                </td>
                              </tr>
                              
                              {/* Phase Tasks with Hierarchical Structure */}
                              {phase.tasks.map((task: any, taskIndex: number) => {
                                const taskStartDate = new Date(phaseStartDate);
                                taskStartDate.setDate(taskStartDate.getDate() + taskIndex);
                                
                                const taskEndDate = new Date(taskStartDate);
                                taskEndDate.setDate(taskEndDate.getDate() + Math.ceil(task.estimatedHours / 8) - 1);
                                
                                // Get subtasks for this task
                                const subtasks = taskHierarchy[task.id] || [];
                                const isExpanded = expandedTasks[task.id] || false;
                                
                                // Determine status based on task
                                const getStatus = () => {
                                  if (taskIndex === 0) return "On Track";
                                  if (taskIndex === 1) return "Ahead";
                                  return "Behind";
                                };
                                
                                const status = getStatus();
                                const getStatusColor = (status: string) => {
                                  switch (status) {
                                    case "On Track": return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
                                    case "Ahead": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
                                    case "Behind": return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
                                    default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
                                  }
                                };
                                
                                return (
                                  <React.Fragment key={task.id}>
                                    {/* Main Task Row */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <div className="flex items-center gap-2">
                                          {/* Expand/Collapse Button */}
                                          <button
                                            onClick={() => toggleTaskExpansion(task.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                          >
                                            {subtasks.length > 0 ? (
                                              isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                                            ) : (
                                              <div className="w-3 h-3"></div>
                                            )}
                                          </button>
                                          
                                          {/* Add Subtask Button */}
                                          <button
                                            onClick={() => addSubtaskToTask(task.id, phase.id)}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-green-600"
                                            title="Add Subtask"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </button>
                                          
                                          {/* Task Info */}
                                          <div className="flex-1">
                                            <div 
                                              className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                                              onClick={() => handleTaskSelect(task)}
                                              title="Click to view PM checklist"
                                            >
                                              {taskIndex + 1} {task.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">{task.description}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center">
                                        {taskIndex > 0 ? taskIndex : "-"}
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <Input
                                          type="date"
                                          value={getDateValue(task.id, 'baseStart', taskStartDate)}
                                          onChange={(e) => handleDateChange(task.id, 'baseStart', e.target.value)}
                                          className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                        />
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <Input
                                          type="date"
                                          value={getDateValue(task.id, 'baseFinish', taskEndDate)}
                                          onChange={(e) => handleDateChange(task.id, 'baseFinish', e.target.value)}
                                          className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                        />
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <Input
                                          type="date"
                                          value={getDateValue(task.id, 'actualStart', new Date())}
                                          onChange={(e) => handleDateChange(task.id, 'actualStart', e.target.value)}
                                          className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                          placeholder="Select date"
                                        />
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <Input
                                          type="date"
                                          value={getDateValue(task.id, 'projectedFinish', taskEndDate)}
                                          onChange={(e) => handleDateChange(task.id, 'projectedFinish', e.target.value)}
                                          className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                          placeholder="Select date"
                                        />
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        {task.estimatedHours}h
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        {Math.ceil(task.estimatedHours / 8)}d
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                        {task.requiredSkills ? task.requiredSkills[0] : "TBD"}
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                          {status}
                                        </span>
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                        -
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                        -
                                      </td>
                                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                        {task.deliverables ? task.deliverables.join(", ") : "-"}
                                      </td>
                                    </tr>
                                    
                                    {/* Subtasks (only show if expanded) */}
                                    {isExpanded && subtasks.map((subtask: any, subtaskIndex: number) => {
                                      const subtaskStartDate = new Date(taskStartDate);
                                      subtaskStartDate.setDate(subtaskStartDate.getDate() + subtaskIndex);
                                      
                                      const subtaskEndDate = new Date(subtaskStartDate);
                                      subtaskEndDate.setDate(subtaskEndDate.getDate() + Math.ceil(subtask.estimatedHours / 8) - 1);
                                      
                                      return (
                                        <tr key={subtask.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-gray-50/50 dark:bg-gray-800/30">
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <div className="flex items-center gap-2 pl-8">
                                              {/* Remove Subtask Button */}
                                              <button
                                                onClick={() => removeSubtask(task.id, subtask.id)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600"
                                                title="Remove Subtask"
                                              >
                                                <Minus className="h-3 w-3" />
                                              </button>
                                              
                                              {/* Subtask Info */}
                                              <div className="flex-1">
                                                <div className="font-medium text-sm">
                                                  {taskIndex + 1}.{subtaskIndex + 1} {subtask.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{subtask.description}</div>
                                              </div>
                                            </div>
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center">
                                            {taskIndex + 1}.{subtaskIndex}
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <Input
                                              type="date"
                                              value={getDateValue(subtask.id, 'baseStart', subtaskStartDate)}
                                              onChange={(e) => handleDateChange(subtask.id, 'baseStart', e.target.value)}
                                              className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                            />
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <Input
                                              type="date"
                                              value={getDateValue(subtask.id, 'baseFinish', subtaskEndDate)}
                                              onChange={(e) => handleDateChange(subtask.id, 'baseFinish', e.target.value)}
                                              className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                            />
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <Input
                                              type="date"
                                              value={getDateValue(subtask.id, 'actualStart', new Date())}
                                              onChange={(e) => handleDateChange(subtask.id, 'actualStart', e.target.value)}
                                              className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                              placeholder="Select date"
                                            />
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <Input
                                              type="date"
                                              value={getDateValue(subtask.id, 'projectedFinish', subtaskEndDate)}
                                              onChange={(e) => handleDateChange(subtask.id, 'projectedFinish', e.target.value)}
                                              className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                              placeholder="Select date"
                                            />
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            {subtask.estimatedHours}h
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            {Math.ceil(subtask.estimatedHours / 8)}d
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                            {subtask.requiredSkills ? subtask.requiredSkills[0] : "TBD"}
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400">
                                              On Track
                                            </span>
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                            -
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                            -
                                          </td>
                                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                            {subtask.deliverables ? subtask.deliverables.join(", ") : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </React.Fragment>
                                );
                              })}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Save Button and Legend */}
                  <div className="mt-4 space-y-4">
                    {/* Unsaved Changes Indicator */}
                    {hasUnsavedChanges && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">You have unsaved changes</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => setShowChecklistPanel(!showChecklistPanel)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4" />
                        {showChecklistPanel ? 'Hide' : 'Show'} PM Checklist
                      </Button>
                      
                      <Button 
                        onClick={handleSaveSchedule}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Schedule Changes
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Status Legend:</h4>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">On Track</span>
                          <span>Task is proceeding as planned</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400">Ahead</span>
                          <span>Task is ahead of schedule</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400">Behind</span>
                          <span>Task is behind schedule</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PM Checklist Side Panel */}
                  {showChecklistPanel && (
                    <div className="mt-6 border-t pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            PM Checklist & Reminders
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Click on any task name above to see contextual PM reminders and checklists. 
                            These help you remember important details without cluttering your main schedule.
                          </p>
                          
                          {selectedTask ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                  Selected Task: {selectedTask.name}
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {selectedTask.description}
                                </p>
                              </div>
                              
                              <div className="space-y-3">
                                <h5 className="font-medium flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4" />
                                  PM Reminders & Checklist
                                </h5>
                                
                                {checklistItems[selectedTask.id]?.map((item: any) => (
                                  <div key={item.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                    <button
                                      onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {item.completed ? (
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-1">
                                      <div className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                        {item.text}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                          item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                          item.priority === 'important' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                          item.priority === 'nice-to-have' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                          'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                                        }`}>
                                          {item.priority === 'critical' ? 'Critical' :
                                           item.priority === 'important' ? 'Important' :
                                           item.priority === 'nice-to-have' ? 'Nice to Have' : 'Custom'}
                                        </span>
                                        {item.priority === 'critical' && (
                                          <AlertTriangle className="h-3 w-3 text-red-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Plus className="h-4 w-4" />
                                    <span>Click on another task above to see its PM checklist</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                              <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                                No Task Selected
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Click on any task name in the schedule above to see its PM checklist and reminders.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Side Panel - Smart Tips */}
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Smart PM Tips
                            </h5>
                            <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                              <p>• <strong>Critical</strong> items should be done before starting the task</p>
                              <p>• <strong>Important</strong> items help ensure quality and success</p>
                              <p>• <strong>Nice to Have</strong> items are best practices</p>
                              <p>• Check off items as you complete them</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Risk Prevention
                            </h5>
                            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                              <p>• Always test equipment before meetings</p>
                              <p>• Check weather for outdoor activities</p>
                              <p>• Verify permits before construction</p>
                              <p>• Confirm stakeholder availability</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {generatedTemplate.selectedDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                        {doc.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Next Steps</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Review and customize the generated schedule</li>
                <li>• Assign team members to specific tasks</li>
                <li>• Set up project milestones and deadlines</li>
                <li>• Begin working on required documents</li>
                <li>• Update project status to "planning" when ready</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={handleCloseSuccess}>
                Back to Dashboard
              </Button>
              <Button onClick={() => {
                // Close the success screen and go to template selection with previous selections
                setShowSuccess(false);
                setShowTemplates(true);
                // Keep selectedProject and currentSchedule so user can modify template selections
              }}>
                Continue with Schedule
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (showScheduleEditor && selectedProject && currentSchedule) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedProject.name} - Schedule Editor
            </h1>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setShowScheduleEditor(false);
                setSelectedProject(null);
                setCurrentSchedule(null);
                setScheduleTasks([]);
                setTaskHierarchy({});
                setExpandedTasks({});
                setSelectedTask(null);
                setChecklistItems({});
                setShowChecklistPanel(false);
                setHasUnsavedChanges(false);
                setEditableDates({});
              }}>
                Back to Dashboard
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Go to template selection to add more phases
                  setShowScheduleEditor(false);
                  setShowTemplates(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Phases
              </Button>
              <Button 
                onClick={handleSaveSchedule}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* Schedule Editor Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Unsaved Changes Indicator */}
            {hasUnsavedChanges && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                </div>
              </div>
            )}

            {/* Project Schedule Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Schedule
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Edit your project timeline with tasks, dates, resources, and status tracking
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Task</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium w-[80px]">Dependency</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Base Start</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Base Finish</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Actual Start</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Projected Finish</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Work Effort</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Duration</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Resource</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Status</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Risks</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Issues</th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleTasks.map((task, taskIndex) => {
                        const subtasks = taskHierarchy[task.id] || [];
                        const isExpanded = expandedTasks[task.id] || false;
                        
                        // Calculate dates
                        const taskStartDate = new Date();
                        taskStartDate.setDate(taskStartDate.getDate() + taskIndex);
                        
                        const taskEndDate = new Date(taskStartDate);
                        taskEndDate.setDate(taskEndDate.getDate() + Math.ceil(task.estimatedHours / 8) - 1);
                        
                        // Determine status
                        const getStatus = () => {
                          if (taskIndex === 0) return "On Track";
                          if (taskIndex === 1) return "Ahead";
                          return "Behind";
                        };
                        
                        const status = getStatus();
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case "On Track": return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
                            case "Ahead": return "text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400";
                            case "Behind": return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
                            default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
                          }
                        };
                        
                        return (
                          <React.Fragment key={task.id}>
                            {/* Main Task Row */}
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                  {/* Expand/Collapse Button */}
                                  <button
                                    onClick={() => toggleTaskExpansion(task.id)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                  >
                                    {subtasks.length > 0 ? (
                                      isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
                                    ) : (
                                      <div className="w-3 h-3"></div>
                                    )}
                                  </button>
                                  
                                  {/* Add Subtask Button */}
                                  <button
                                    onClick={() => addSubtaskToTask(task.id, task.phaseId)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-green-600"
                                    title="Add Subtask"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                  
                                  {/* Task Info */}
                                  <div className="flex-1">
                                    <div 
                                      className="font-medium cursor-pointer hover:text-blue-600 hover:underline"
                                      onClick={() => handleTaskSelect(task)}
                                      title="Click to view PM checklist"
                                    >
                                      {taskIndex + 1} {task.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{task.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center">
                                {taskIndex > 0 ? taskIndex : "-"}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <Input
                                  type="date"
                                  value={getDateValue(task.id, 'baseStart', taskStartDate)}
                                  onChange={(e) => handleDateChange(task.id, 'baseStart', e.target.value)}
                                  className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                />
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <Input
                                  type="date"
                                  value={getDateValue(task.id, 'baseFinish', taskEndDate)}
                                  onChange={(e) => handleDateChange(task.id, 'baseFinish', e.target.value)}
                                  className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                />
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <Input
                                  type="date"
                                  value={getDateValue(task.id, 'actualStart', new Date())}
                                  onChange={(e) => handleDateChange(task.id, 'actualStart', e.target.value)}
                                  className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                  placeholder="Select date"
                                />
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <Input
                                  type="date"
                                  value={getDateValue(task.id, 'projectedFinish', taskEndDate)}
                                  onChange={(e) => handleDateChange(task.id, 'projectedFinish', e.target.value)}
                                  className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                  placeholder="Select date"
                                />
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                {task.estimatedHours}h
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                {Math.ceil(task.estimatedHours / 8)}d
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                {task.requiredSkills ? task.requiredSkills[0] : "TBD"}
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                -
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                -
                              </td>
                              <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                {task.deliverables ? task.deliverables.join(", ") : "-"}
                              </td>
                            </tr>
                            
                            {/* Subtasks (only show if expanded) */}
                            {isExpanded && subtasks.map((subtask: any, subtaskIndex: number) => {
                              const subtaskStartDate = new Date(taskStartDate);
                              subtaskStartDate.setDate(subtaskStartDate.getDate() + subtaskIndex);
                              
                              const subtaskEndDate = new Date(subtaskStartDate);
                              subtaskEndDate.setDate(subtaskEndDate.getDate() + Math.ceil(subtask.estimatedHours / 8) - 1);
                              
                              return (
                                <tr key={subtask.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 bg-gray-50/50 dark:bg-gray-800/30">
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <div className="flex items-center gap-2 pl-8">
                                      {/* Remove Subtask Button */}
                                      <button
                                        onClick={() => removeSubtask(task.id, subtask.id)}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600"
                                        title="Remove Subtask"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </button>
                                      
                                      {/* Subtask Info */}
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {taskIndex + 1}.{subtaskIndex + 1} {subtask.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{subtask.description}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-center">
                                    {taskIndex + 1}.{subtaskIndex}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <Input
                                      type="date"
                                      value={getDateValue(subtask.id, 'baseStart', subtaskStartDate)}
                                      onChange={(e) => handleDateChange(subtask.id, 'baseStart', e.target.value)}
                                      className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <Input
                                      type="date"
                                      value={getDateValue(subtask.id, 'baseFinish', subtaskEndDate)}
                                      onChange={(e) => handleDateChange(subtask.id, 'baseFinish', e.target.value)}
                                      className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <Input
                                      type="date"
                                      value={getDateValue(subtask.id, 'actualStart', new Date())}
                                      onChange={(e) => handleDateChange(subtask.id, 'actualStart', e.target.value)}
                                      className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                      placeholder="Select date"
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <Input
                                      type="date"
                                      value={getDateValue(subtask.id, 'projectedFinish', subtaskEndDate)}
                                      onChange={(e) => handleDateChange(subtask.id, 'projectedFinish', e.target.value)}
                                      className="h-8 text-xs border-0 p-1 bg-transparent focus:bg-white focus:border focus:border-blue-300 rounded"
                                      placeholder="Select date"
                                    />
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    {subtask.estimatedHours}h
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    {Math.ceil(subtask.estimatedHours / 8)}d
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                    {subtask.requiredSkills ? subtask.requiredSkills[0] : "TBD"}
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400">
                                      On Track
                                    </span>
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                    -
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                    -
                                  </td>
                                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-muted-foreground">
                                    {subtask.deliverables ? subtask.deliverables.join(", ") : "-"}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* PM Checklist Panel */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <Button 
                      onClick={() => setShowChecklistPanel(!showChecklistPanel)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Lightbulb className="h-4 w-4" />
                      {showChecklistPanel ? 'Hide' : 'Show'} PM Checklist
                    </Button>
                  </div>
                  
                  {showChecklistPanel && (
                    <div className="border-t pt-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                            PM Checklist & Reminders
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Click on any task name above to see contextual PM reminders and checklists. 
                            These help you remember important details without cluttering your main schedule.
                          </p>
                          
                          {selectedTask ? (
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                  Selected Task: {selectedTask.name}
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                  {selectedTask.description}
                                </p>
                              </div>
                              
                              <div className="space-y-3">
                                <h5 className="font-medium flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4" />
                                  PM Reminders & Checklist
                                </h5>
                                
                                {checklistItems[selectedTask.id]?.map((item: any) => (
                                  <div key={item.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                    <button
                                      onClick={() => toggleChecklistItem(selectedTask.id, item.id)}
                                      className="mt-0.5 flex-shrink-0"
                                    >
                                      {item.completed ? (
                                        <CheckSquare className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Square className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                      )}
                                    </button>
                                    
                                    <div className="flex-1">
                                      <div className={`text-sm ${item.completed ? 'line-through text-gray-500' : ''}`}>
                                        {item.text}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                          item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                          item.priority === 'important' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                          item.priority === 'nice-to-have' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                          'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                                        }`}>
                                          {item.priority === 'critical' ? 'Critical' :
                                           item.priority === 'important' ? 'Important' :
                                           item.priority === 'nice-to-have' ? 'Nice to Have' : 'Custom'}
                                        </span>
                                        {item.priority === 'critical' && (
                                          <AlertTriangle className="h-3 w-3 text-red-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Plus className="h-4 w-4" />
                                    <span>Click on another task above to see its PM checklist</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                              <Lightbulb className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                              <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                                No Task Selected
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                Click on any task name in the schedule above to see its PM checklist and reminders.
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Side Panel - Smart Tips */}
                        <div className="space-y-4">
                          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Smart PM Tips
                            </h5>
                            <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                              <p>• <strong>Critical</strong> items should be done before starting the task</p>
                              <p>• <strong>Important</strong> items help ensure quality and success</p>
                              <p>• <strong>Nice to Have</strong> items are best practices</p>
                              <p>• Check off items as you complete them</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Risk Prevention
                            </h5>
                            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                              <p>• Always test equipment before meetings</p>
                              <p>• Check weather for outdoor activities</p>
                              <p>• Verify permits before construction</p>
                              <p>• Confirm stakeholder availability</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (showTemplates && selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Planning</h1>
            <Button variant="outline" onClick={handleCloseTemplates}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        {/* Template Selection */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Planning: {selectedProject.name}
              </h2>
              <p className="text-muted-foreground">
                Select a smart template to generate your project schedule and required documents.
              </p>
            </div>
        <ProjectPlanningTemplates
          projectCategory={selectedProject.category}
          onTemplateSelect={handleTemplateSelect}
          onClose={handleCloseTemplates}
          previouslySelectedPhases={currentSchedule?.selectedPhases}
          previouslySelectedDocuments={currentSchedule?.selectedDocuments}
          isAddMode={!!currentSchedule}
          existingTasks={scheduleTasks}
        />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Project Manager Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role.toUpperCase()}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Projects Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>My Projects</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Start</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Finish</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Finish</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spend to Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Complete</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link to Risks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link to Issues</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projectsLoading ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading projects...</span>
                          </div>
                        </td>
                      </tr>
                    ) : projectsError ? (
                      <tr>
                        <td colSpan={11} className="px-6 py-4 text-center text-red-500">
                          <div className="flex items-center justify-center space-x-2">
                            <AlertCircle className="h-4 w-4" />
                            <span>Failed to load projects</span>
                          </div>
                        </td>
                      </tr>
                    ) : projectsData?.projects && projectsData.projects.length > 0 ? (
                      projectsData.projects.map((project: any) => (
                        <tr 
                          key={project.id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleProjectClick(project)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            <div className="text-sm text-gray-500">ID: {project.id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{project.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.plannedStartDate ? new Date(project.plannedStartDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.plannedEndDate ? new Date(project.plannedEndDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.projectedEndDate ? new Date(project.projectedEndDate).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.budget?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.spentToDate?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${project.progressPercentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-900">{project.progressPercentage || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={
                                project.status === 'completed' ? 'default' :
                                project.status === 'in_progress' ? 'default' :
                                project.status === 'initiate' ? 'secondary' :
                                project.status === 'planning' ? 'secondary' :
                                'outline'
                              }
                              className={
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                project.status === 'initiate' ? 'bg-yellow-100 text-yellow-800' :
                                project.status === 'planning' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {project.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewRAID(project);
                              }}
                            >
                              View RAID
                            </Button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-green-600 hover:text-green-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjectForRisk(project);
                                setShowRiskManagement(true);
                              }}
                            >
                              Add RAID
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="px-6 py-4 text-center text-muted-foreground">
                          <div className="flex flex-col items-center space-y-2">
                            <ClipboardList className="h-8 w-8" />
                            <p>No projects assigned to you yet</p>
                            <p className="text-sm">Contact your administrator to get projects assigned</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* RAID Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>RAID</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => handleRiskManagementClick(projectsData?.projects?.[0])}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-red-50 hover:bg-red-100 border-red-200"
                  variant="outline"
                >
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Risk</span>
                </Button>
                
                <Button 
                  onClick={() => handleRiskManagementClick(projectsData?.projects?.[0])}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 border-orange-200"
                  variant="outline"
                >
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Issue</span>
                </Button>
                
                <Button 
                  onClick={() => handleRiskManagementClick(projectsData?.projects?.[0])}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
                  variant="outline"
                >
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Decision</span>
                </Button>
                
                <Button 
                  onClick={() => handleRiskManagementClick(projectsData?.projects?.[0])}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 border-green-200"
                  variant="outline"
                >
                  <Target className="h-6 w-6 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Record Action</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* RAID Forms Modal */}
      {showRiskManagement && selectedProjectForRisk && (
        <RiskManagementForms
          projectId={selectedProjectForRisk.id}
          onClose={handleRiskManagementClose}
          onSuccess={handleRiskManagementSuccess}
        />
      )}

      {showRAIDDashboard && selectedProjectForRAID && (
        <RAIDDashboard
          projectId={selectedProjectForRAID.id}
          projectName={selectedProjectForRAID.name}
          onClose={handleRAIDDashboardClose}
          onAddNew={handleRAIDAddNew}
        />
      )}
    </div>
  );
};

export default PMDashboard;
