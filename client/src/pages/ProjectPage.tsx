import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Brain,
  Target,
  Clock,
  Bell,
  Zap,
  BarChart3,
  Shield,
  Activity,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronDown,
  Save,
  Loader2,
  FileText,
  X,
  LogOut
} from 'lucide-react';
import { ProjectTable } from '@/components/ProjectTable';
import RAIDDashboard from '@/components/RAIDDashboard';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import ProjectHealthScoreCard from '@/components/ProjectHealthScoreCard';
import SmartResourceAllocation from '@/components/SmartResourceAllocation';
import RiskTrendAnalysis from '@/components/RiskTrendAnalysis';
import DeadlineReminders from '@/components/DeadlineReminders';
import EscalationRules from '@/components/EscalationRules';
import SmartNotifications from '@/components/SmartNotifications';
import AITaskAssignment from '@/components/AITaskAssignment';
import { 
  getCurrentScheduleFresh as getCurrentSchedule,
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
} from '@/api/pm-tool-api-fresh';
import ProjectPlanningTemplates from '@/components/ProjectPlanningTemplates';

interface Project {
  id: string;
  code?: string;
  name: string;
  description: string;
  status: 'planning' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progressPercentage: number;
  category: string;
  priority: string;
  scope: string;
  fundingSource: string;
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  projectManagerId?: string;
  assignedTo?: string;
}

interface ProjectPageProps {
  projectId: string;
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
  const [, params] = useRoute('/project/:id');
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Schedule Editor State
  const [currentSchedule, setCurrentSchedule] = useState<ProjectSchedule | null>(null);
  const [scheduleTasks, setScheduleTasks] = useState<ScheduleTask[]>([]);
  const [taskHierarchy, setTaskHierarchy] = useState<Record<string, ScheduleTask[]>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [checklistItems, setChecklistItems] = useState<Record<string, any[]>>({});
  const [showChecklistPanel, setShowChecklistPanel] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editableDates, setEditableDates] = useState<Record<string, { start?: string; finish?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [checklistTemplates, setChecklistTemplates] = useState<PMChecklistTemplate[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [projectSettings, setProjectSettings] = useState({
    name: '',
    description: '',
    category: '',
    priority: '',
    scope: '',
    fundingSource: '',
    budgetAllocated: 0,
    currency: 'GYD',
    plannedStartDate: '',
    plannedEndDate: '',
    notifications: {
      deadlineAlerts: true,
      budgetAlerts: true,
      riskAlerts: true,
      teamUpdates: true
    }
  });

  // Fetch real project data from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // Fetch project data from API
        const response = await fetch(`/api/projects/${projectId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        
        const projectData = await response.json();
        setProject(projectData);
        
        // Populate settings with project data
        setProjectSettings({
          name: projectData.name,
          description: projectData.description,
          category: projectData.category,
          priority: projectData.priority,
          scope: projectData.scope,
          fundingSource: projectData.fundingSource,
          budgetAllocated: projectData.budgetAllocated,
          currency: projectData.currency,
          plannedStartDate: projectData.plannedStartDate,
          plannedEndDate: projectData.plannedEndDate,
          notifications: {
            deadlineAlerts: true,
            budgetAlerts: true,
            riskAlerts: true,
            teamUpdates: true
          }
        });
      } catch (error) {
        console.error('Error fetching project:', error);
        // Set a fallback project if API fails
        const fallbackProject: Project = {
          id: projectId,
          code: 'UNKNOWN',
          name: 'Project Not Found',
          description: 'Unable to load project data',
          status: 'planning',
          progressPercentage: 0,
          category: 'unknown',
          priority: 'medium',
          scope: 'unknown',
          fundingSource: 'unknown',
          budgetAllocated: 0,
          budgetSpent: 0,
          currency: 'GYD',
          plannedStartDate: new Date().toISOString().split('T')[0],
          plannedEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProject(fallbackProject);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Schedule Editor Functions
  useEffect(() => {
    const loadSchedule = async () => {
      if (!projectId) return;
      
      console.log('🔄 LOADING SCHEDULE - Starting to load schedule for project:', projectId);
      try {
        const schedule = await getCurrentSchedule(projectId);
        console.log('📊 SCHEDULE LOADED - Schedule result:', schedule);
        setCurrentSchedule(schedule);
        
        if (schedule) {
          console.log('✅ SCHEDULE FOUND - Loading tasks for schedule:', schedule.id);
          const tasks = await getScheduleTasks(schedule.id);
          console.log('📋 TASKS LOADED - Found', tasks.length, 'tasks');
          setScheduleTasks(tasks);
          
          // Build task hierarchy
          const hierarchy: Record<string, ScheduleTask[]> = {};
          tasks.forEach(task => {
            if (task.parentTaskId) {
              if (!hierarchy[task.parentTaskId]) {
                hierarchy[task.parentTaskId] = [];
              }
              hierarchy[task.parentTaskId].push(task);
            }
          });
          setTaskHierarchy(hierarchy);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    loadSchedule();
  }, [projectId]);

  // Load checklist templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await getScheduleTemplates();
        setTemplates(templates);
        
        const checklistTemplates = await getPMChecklistTemplates();
        setChecklistTemplates(checklistTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, []);

  const handleSaveSchedule = async () => {
    if (!currentSchedule) return;
    
    setIsSaving(true);
    try {
      await updateSchedule(projectId, currentSchedule.id, currentSchedule);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPhases = async () => {
    console.log('Add Phases clicked - checking if schedule exists');
    
    // If no schedule exists, create one first
    if (!currentSchedule) {
      try {
        console.log('No schedule exists, creating new schedule...');
        const newSchedule = await createSchedule(projectId, {
          name: "Current Project Schedule",
          description: "Active project schedule",
          templateId: "building-construction",
          templateName: "Building Construction"
        });
        setCurrentSchedule(newSchedule);
        console.log('New schedule created:', newSchedule);
      } catch (error) {
        console.error('Error creating schedule:', error);
        alert('Error creating schedule. Please try again.');
        return;
      }
    }
    
    console.log('Showing template selection');
    setShowTemplates(true);
  };

  const handleClearSchedule = async () => {
    if (!confirm('Are you sure you want to clear the current schedule? This will delete all phases and tasks.')) {
      return;
    }
    
    try {
      // Delete the schedule from the server
      const response = await fetch(`/api/projects/${projectId}/schedules/current`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete schedule from server');
      }
      
      // Clear the frontend state
      setCurrentSchedule(null);
      setScheduleTasks([]);
      setTaskHierarchy({});
      setHasUnsavedChanges(false);
      
      console.log('Schedule cleared successfully from server and frontend');
      alert('Schedule cleared! You can now add fresh phases.');
    } catch (error) {
      console.error('Error clearing schedule:', error);
      alert('Error clearing schedule. Please try again.');
    }
  };

  const handleTemplateSelection = async (templateData: any) => {
    if (!currentSchedule) return;
    
    try {
      console.log('🎯 Template data received:', templateData);
      const selectedPhases = templateData.selectedPhases || [];
      const selectedDocuments = templateData.selectedDocuments || [];
      
      console.log('📋 Adding selected phases to schedule:', selectedPhases);
      console.log('📄 Selected documents:', selectedDocuments);
      console.log('📊 selectedPhases length:', selectedPhases.length);
      console.log('📊 selectedDocuments length:', selectedDocuments.length);
      
      // Check if schedule already has tasks - if so, inform user that we'll add to existing tasks
      if (scheduleTasks.length > 0) {
        console.log(`Adding new phases to existing schedule with ${scheduleTasks.length} tasks`);
        // We'll add to existing tasks, not replace them
      }
      
      // Start with existing tasks to preserve them
      const allTasks: ScheduleTask[] = [...scheduleTasks];
      const timestamp = Date.now();
      
      console.log(`📋 Starting with ${allTasks.length} existing tasks`);
      
      console.log('🏗️ Starting to create tasks...');
      console.log('⏰ Timestamp:', timestamp);
      
      // Create summary tasks (phases) and their subtasks
      selectedPhases.forEach((phase, phaseIndex) => {
        console.log(`🔄 Processing phase ${phaseIndex}:`, phase);
        const phaseId = `phase-${phase.id}-${timestamp}`;
        const phaseStartDate = new Date(Date.now() + phaseIndex * 30 * 24 * 60 * 60 * 1000);
        const phaseEndDate = new Date(phaseStartDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        // Create the phase as a summary task
        const phaseTask: ScheduleTask = {
          id: phaseId,
          name: phase.name,
          description: phase.description || `${phase.name} phase`,
          startDate: phaseStartDate.toISOString().split('T')[0],
          endDate: phaseEndDate.toISOString().split('T')[0],
          status: "not-started" as const,
          priority: "high" as const,
          progress: 0,
          estimatedHours: 0, // Will be calculated from subtasks
          actualHours: 0,
          assignedTo: null,
          parentTaskId: null, // This is a summary task
          dependencies: phaseIndex > 0 ? [`phase-${selectedPhases[phaseIndex - 1].id}-${timestamp}`] : [],
          subtasks: []
        };
        
        allTasks.push(phaseTask);
        console.log(`✅ Added phase task: ${phaseTask.name} (total tasks: ${allTasks.length})`);
        
        // Create subtasks for this phase using the actual template tasks
        if (phase.tasks && phase.tasks.length > 0) {
          console.log(`📋 Using ${phase.tasks.length} tasks from template for ${phase.name}`);
          
          phase.tasks.forEach((templateTask, taskIndex) => {
            const taskStartDate = new Date(phaseStartDate.getTime() + taskIndex * 10 * 24 * 60 * 60 * 1000);
            const taskEndDate = new Date(taskStartDate.getTime() + 10 * 24 * 60 * 60 * 1000);
            
            const subtaskTask: ScheduleTask = {
              id: `subtask-${phase.id}-${taskIndex}-${timestamp}`,
              name: templateTask.name,
              description: templateTask.description || `${templateTask.name} task`,
              startDate: taskStartDate.toISOString().split('T')[0],
              endDate: taskEndDate.toISOString().split('T')[0],
              status: "not-started" as const,
              priority: "medium" as const,
              progress: 0,
              estimatedHours: templateTask.estimatedHours || 8,
              actualHours: 0,
              assignedTo: null,
              parentTaskId: phaseId,
              dependencies: taskIndex > 0 ? [`subtask-${phase.id}-${taskIndex - 1}-${timestamp}`] : [],
              subtasks: []
            };
            
            allTasks.push(subtaskTask);
            console.log(`✅ Added template task: ${subtaskTask.name} (total tasks: ${allTasks.length})`);
          });
        } else {
          console.log(`⚠️ No tasks found in template for ${phase.name}, creating default subtasks`);
          
          // Fallback to default subtasks if template doesn't have tasks
          const defaultSubtasks = [
            {
              name: `${phase.name} - Initiation`,
              description: `Initial setup and planning for ${phase.name}`,
              estimatedHours: 8
            },
            {
              name: `${phase.name} - Execution`,
              description: `Main execution activities for ${phase.name}`,
              estimatedHours: 16
            },
            {
              name: `${phase.name} - Review`,
              description: `Review and validation for ${phase.name}`,
              estimatedHours: 8
            }
          ];
          
          defaultSubtasks.forEach((subtask, subtaskIndex) => {
            const subtaskStartDate = new Date(phaseStartDate.getTime() + subtaskIndex * 10 * 24 * 60 * 60 * 1000);
            const subtaskEndDate = new Date(subtaskStartDate.getTime() + 10 * 24 * 60 * 60 * 1000);
            
            const subtaskTask: ScheduleTask = {
              id: `subtask-${phase.id}-${subtaskIndex}-${timestamp}`,
              name: subtask.name,
              description: subtask.description,
              startDate: subtaskStartDate.toISOString().split('T')[0],
              endDate: subtaskEndDate.toISOString().split('T')[0],
              status: "not-started" as const,
              priority: "medium" as const,
              progress: 0,
              estimatedHours: subtask.estimatedHours,
              actualHours: 0,
              assignedTo: null,
              parentTaskId: phaseId,
              dependencies: subtaskIndex > 0 ? [`subtask-${phase.id}-${subtaskIndex - 1}-${timestamp}`] : [],
              subtasks: []
            };
            
            allTasks.push(subtaskTask);
            console.log(`✅ Added default subtask: ${subtaskTask.name} (total tasks: ${allTasks.length})`);
          });
        }
      });

      // Create document tasks for each selected document
      selectedDocuments.forEach((document, docIndex) => {
        const docStartDate = new Date(Date.now() + (selectedPhases.length * 30 + docIndex * 7) * 24 * 60 * 60 * 1000);
        const docEndDate = new Date(docStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const documentTask: ScheduleTask = {
          id: `document-${document.id}-${timestamp}`,
          name: `📄 ${document.name}`,
          description: document.description || `Document: ${document.name}`,
          startDate: docStartDate.toISOString().split('T')[0],
          endDate: docEndDate.toISOString().split('T')[0],
          status: "not-started" as const,
          priority: "medium" as const,
          progress: 0,
          estimatedHours: 4, // Default hours for document tasks
          actualHours: 0,
          assignedTo: null,
          parentTaskId: null, // Documents are standalone tasks
          dependencies: selectedPhases.length > 0 ? [`phase-${selectedPhases[selectedPhases.length - 1].id}-${timestamp}`] : [],
          subtasks: []
        };
        
        allTasks.push(documentTask);
        console.log(`✅ Added document task: ${documentTask.name} (total tasks: ${allTasks.length})`);
      });

      // Save all tasks (phases, subtasks, and documents)
      console.log('Saving bulk tasks:', allTasks);
    console.log('💾 SCHEDULE SAVED - allTasks length:', allTasks.length);
    console.log('📊 allTasks type:', typeof allTasks);
    console.log('📊 allTasks is array:', Array.isArray(allTasks));
      
      if (!Array.isArray(allTasks) || allTasks.length === 0) {
        throw new Error('No tasks to save - allTasks is empty or not an array');
      }
      
      await saveBulkTasks(currentSchedule.id, allTasks);
      
      // Reload the schedule
      const tasks = await getScheduleTasks(currentSchedule.id);
      setScheduleTasks(tasks);
      
      // Build task hierarchy
      const hierarchy: Record<string, ScheduleTask[]> = {};
      tasks.forEach(task => {
        if (task.parentTaskId) {
          if (!hierarchy[task.parentTaskId]) {
            hierarchy[task.parentTaskId] = [];
          }
          hierarchy[task.parentTaskId].push(task);
        }
      });
      setTaskHierarchy(hierarchy);
      
      setHasUnsavedChanges(true);
      setShowTemplates(false);
      
      console.log('Phases and subtasks added successfully!');
    } catch (error) {
      console.error('Error adding phases:', error);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleTaskSelect = async (task: ScheduleTask) => {
    setSelectedTask(task);
    setShowChecklistPanel(true);
    
    try {
      const checklist = await getChecklistForTaskType(task.taskType || 'general');
      setChecklistItems(prev => ({
        ...prev,
        [task.id]: checklist
      }));
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const handleDateChange = (taskId: string, field: 'start' | 'finish', value: string) => {
    setEditableDates(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSettingsChange = (field: string, value: any) => {
    setProjectSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setProjectSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // In a real app, this would save to the API
      console.log('Saving project settings:', projectSettings);
      
      // Update the project state
      if (project) {
        setProject(prev => prev ? {
          ...prev,
          name: projectSettings.name,
          description: projectSettings.description,
          category: projectSettings.category,
          priority: projectSettings.priority,
          scope: projectSettings.scope,
          fundingSource: projectSettings.fundingSource,
          budgetAllocated: projectSettings.budgetAllocated,
          currency: projectSettings.currency,
          plannedStartDate: projectSettings.plannedStartDate,
          plannedEndDate: projectSettings.plannedEndDate
        } : null);
      }
      
      setShowSettings(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GY', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(project.plannedEndDate);
  const budgetUtilization = (project.budgetSpent / project.budgetAllocated) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-500">{project.code}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Project Health</div>
                <div className="text-2xl font-bold text-green-600">78/100</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/auth/logout', {
                      method: 'POST',
                      credentials: 'include'
                    });
                    if (response.ok) {
                      window.location.href = '/';
                    }
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
                className="text-red-600 hover:text-red-800 border-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Project Settings</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="project-name">Project Name</Label>
                          <Input
                            id="project-name"
                            value={projectSettings.name}
                            onChange={(e) => handleSettingsChange('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-category">Category</Label>
                          <Select value={projectSettings.category} onValueChange={(value) => handleSettingsChange('category', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="infrastructure">Infrastructure</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="transportation">Transportation</SelectItem>
                              <SelectItem value="environment">Environment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                          id="project-description"
                          value={projectSettings.description}
                          onChange={(e) => handleSettingsChange('description', e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="project-priority">Priority</Label>
                          <Select value={projectSettings.priority} onValueChange={(value) => handleSettingsChange('priority', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="project-scope">Scope</Label>
                          <Select value={projectSettings.scope} onValueChange={(value) => handleSettingsChange('scope', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select scope" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">Local</SelectItem>
                              <SelectItem value="regional">Regional</SelectItem>
                              <SelectItem value="national">National</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="project-funding">Funding Source</Label>
                          <Select value={projectSettings.fundingSource} onValueChange={(value) => handleSettingsChange('fundingSource', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select funding" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">Local</SelectItem>
                              <SelectItem value="regional">Regional</SelectItem>
                              <SelectItem value="national">National</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Budget & Timeline */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Budget & Timeline</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="project-budget">Budget Allocated</Label>
                          <div className="flex gap-2">
                            <Input
                              id="project-budget"
                              type="number"
                              value={projectSettings.budgetAllocated}
                              onChange={(e) => handleSettingsChange('budgetAllocated', Number(e.target.value))}
                            />
                            <Select value={projectSettings.currency} onValueChange={(value) => handleSettingsChange('currency', value)}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GYD">GYD</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="EUR">EUR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="project-start">Start Date</Label>
                          <Input
                            id="project-start"
                            type="date"
                            value={projectSettings.plannedStartDate}
                            onChange={(e) => handleSettingsChange('plannedStartDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="project-end">End Date</Label>
                          <Input
                            id="project-end"
                            type="date"
                            value={projectSettings.plannedEndDate}
                            onChange={(e) => handleSettingsChange('plannedEndDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="deadline-alerts">Deadline Alerts</Label>
                          <input
                            id="deadline-alerts"
                            type="checkbox"
                            checked={projectSettings.notifications.deadlineAlerts}
                            onChange={(e) => handleNotificationChange('deadlineAlerts', e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="budget-alerts">Budget Alerts</Label>
                          <input
                            id="budget-alerts"
                            type="checkbox"
                            checked={projectSettings.notifications.budgetAlerts}
                            onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="risk-alerts">Risk Alerts</Label>
                          <input
                            id="risk-alerts"
                            type="checkbox"
                            checked={projectSettings.notifications.riskAlerts}
                            onChange={(e) => handleNotificationChange('riskAlerts', e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="team-updates">Team Updates</Label>
                          <input
                            id="team-updates"
                            type="checkbox"
                            checked={projectSettings.notifications.teamUpdates}
                            onChange={(e) => handleNotificationChange('teamUpdates', e.target.checked)}
                            className="h-4 w-4"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowSettings(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveSettings}>
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Project Context Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.progressPercentage}%</div>
              <Progress value={project.progressPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Started {formatDate(project.actualStartDate || project.plannedStartDate)}
              </p>
            </CardContent>
          </Card>

          {/* Budget Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(project.budgetSpent, project.currency)}
              </div>
              <div className="text-xs text-muted-foreground">
                of {formatCurrency(project.budgetAllocated, project.currency)}
              </div>
              <Progress value={budgetUtilization} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {budgetUtilization.toFixed(1)}% utilized
              </p>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timeline</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
              </div>
              <div className="text-xs text-muted-foreground">
                {daysRemaining > 0 ? 'remaining' : 'past due'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Due {formatDate(project.plannedEndDate)}
              </p>
            </CardContent>
          </Card>

          {/* Team Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs text-muted-foreground">active members</div>
              <p className="text-xs text-muted-foreground mt-2">
                PM: John Doe
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Smart Buttons Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Project Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Analytics & Health */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('analytics')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600">Deep insights & trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('health')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Project Health</h3>
                    <p className="text-sm text-gray-600">AI-powered health score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource & Risk Management */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('resources')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Resource Allocation</h3>
                    <p className="text-sm text-gray-600">Smart team optimization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('risks')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Risk Trends</h3>
                    <p className="text-sm text-gray-600">Predictive risk analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline & Escalation */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('deadlines')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Deadlines</h3>
                    <p className="text-sm text-gray-600">Critical timeline tracking</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('escalations')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Escalations</h3>
                    <p className="text-sm text-gray-600">Smart escalation rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI & Notifications */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('alerts')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Bell className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Alerts</h3>
                    <p className="text-sm text-gray-600">Intelligent notifications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('ai-tasks')}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Brain className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Tasks</h3>
                    <p className="text-sm text-gray-600">Automated task assignment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="raid">RAID</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="checklist">PM Checklist</TabsTrigger>
            <TabsTrigger value="ai-tasks">AI Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="text-sm text-gray-900 mt-1">{project.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Category</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.category}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Scope</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.scope}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Funding Source</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{project.fundingSource}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Project milestone completed</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Budget review completed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Risk assessment updated</p>
                        <p className="text-xs text-gray-500">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <div className="space-y-6">
              {/* Schedule Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Project Schedule</h2>
                  <p className="text-gray-600">Manage project phases, tasks, and timelines</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={handleAddPhases}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Phases
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleClearSchedule}
                    className="flex items-center gap-2 text-red-600 hover:text-red-800 border-red-300"
                  >
                    <X className="h-4 w-4" />
                    Clear Schedule
                  </Button>
                  <Button 
                    onClick={handleSaveSchedule}
                    disabled={isSaving || !hasUnsavedChanges}
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

              {/* Schedule Content */}
              {currentSchedule ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Schedule: {currentSchedule.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Task</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium w-[80px]">Dependency</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Base Start</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Base Finish</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Actual Start</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Projected Finish</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Work Effort</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Duration</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Resource</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Status</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Risks</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Issues</th>
                            <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Comments</th>
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
                            taskEndDate.setDate(taskEndDate.getDate() + (task.estimatedDays || 1));
                            
                            return (
                              <React.Fragment key={task.id}>
                                <tr className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      {subtasks.length > 0 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleTaskToggle(task.id)}
                                          className="h-6 w-6 p-0"
                                        >
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                      <span 
                                        className="cursor-pointer hover:text-blue-600"
                                        onClick={() => handleTaskSelect(task)}
                                      >
                                        {task.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.dependency || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    <input
                                      type="date"
                                      value={editableDates[task.id]?.start || taskStartDate.toISOString().split('T')[0]}
                                      onChange={(e) => handleDateChange(task.id, 'start', e.target.value)}
                                      className="w-full border-0 bg-transparent text-sm"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    <input
                                      type="date"
                                      value={editableDates[task.id]?.finish || taskEndDate.toISOString().split('T')[0]}
                                      onChange={(e) => handleDateChange(task.id, 'finish', e.target.value)}
                                      className="w-full border-0 bg-transparent text-sm"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.actualStartDate ? new Date(task.actualStartDate).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.projectedFinishDate ? new Date(task.projectedFinishDate).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.workEffort || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.estimatedDays || 1} days
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.assignedResource || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                      {task.status || 'pending'}
                                    </Badge>
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.risks || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.issues || '-'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 text-sm">
                                    {task.comments || '-'}
                                  </td>
                                </tr>
                                
                                {/* Subtasks */}
                                {isExpanded && subtasks.map((subtask) => (
                                  <tr key={subtask.id} className="bg-gray-50">
                                    <td className="border border-gray-300 px-3 py-2 pl-8">
                                      <span 
                                        className="cursor-pointer hover:text-blue-600"
                                        onClick={() => handleTaskSelect(subtask)}
                                      >
                                        {subtask.name}
                                      </span>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.dependency || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      <input
                                        type="date"
                                        value={editableDates[subtask.id]?.start || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => handleDateChange(subtask.id, 'start', e.target.value)}
                                        className="w-full border-0 bg-transparent text-sm"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      <input
                                        type="date"
                                        value={editableDates[subtask.id]?.finish || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => handleDateChange(subtask.id, 'finish', e.target.value)}
                                        className="w-full border-0 bg-transparent text-sm"
                                      />
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.actualStartDate ? new Date(subtask.actualStartDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.projectedFinishDate ? new Date(subtask.projectedFinishDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.workEffort || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.estimatedDays || 1} days
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.assignedResource || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      <Badge variant={subtask.status === 'completed' ? 'default' : 'secondary'}>
                                        {subtask.status || 'pending'}
                                      </Badge>
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.risks || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.issues || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-sm">
                                      {subtask.comments || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Found</h3>
                    <p className="text-gray-600 mb-4">This project doesn't have a schedule yet.</p>
                    <Button onClick={() => setShowTemplates(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Checklist Panel */}
              {showChecklistPanel && selectedTask && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Task Checklist: {selectedTask.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowChecklistPanel(false)}
                      >
                        ×
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checklistItems[selectedTask.id]?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Square className="h-4 w-4" />
                          </Button>
                          <span className="text-sm">{item.description || item}</span>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-sm">No checklist items available for this task.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="raid" className="mt-6">
            <RAIDDashboard projectId={projectId} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AdvancedAnalytics projectId={projectId} />
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <ProjectHealthScoreCard projectId={projectId} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <SmartResourceAllocation projectId={projectId} />
          </TabsContent>

          <TabsContent value="risks" className="mt-6">
            <RiskTrendAnalysis projectId={projectId} />
          </TabsContent>

          <TabsContent value="checklist" className="mt-6">
            <div className="space-y-6">
              {/* PM Checklist Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">PM Checklist</h2>
                  <p className="text-gray-600">Project management checklists and templates</p>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Load Template
                </Button>
              </div>

              {/* Checklist Templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklistTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Tasks:</span>
                          <span className="font-medium">{template.tasks?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Category:</span>
                          <span className="font-medium">{template.category}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => {
                            // Load template checklist items
                            setChecklistItems(prev => ({
                              ...prev,
                              'template': template.tasks || []
                            }));
                          }}
                        >
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Active Checklist */}
              {checklistItems['template'] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="h-5 w-5" />
                      Active Checklist
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checklistItems['template'].map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              // Toggle checklist item
                              console.log('Toggle item:', item);
                            }}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.description || item}</span>
                            {item.category && (
                              <span className="text-xs text-gray-500 ml-2">({item.category})</span>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {item.priority || 'Normal'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Task-Specific Checklists */}
              {Object.keys(checklistItems).filter(key => key !== 'template').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Task Checklists
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(checklistItems).map(([taskId, items]) => {
                        if (taskId === 'template') return null;
                        const task = scheduleTasks.find(t => t.id === taskId);
                        return (
                          <div key={taskId} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              {task?.name || `Task ${taskId}`}
                            </h4>
                            <div className="space-y-2">
                              {items.map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                  >
                                    <Square className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm">{item.description || item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No Checklists Message */}
              {Object.keys(checklistItems).length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Checklists Available</h3>
                    <p className="text-gray-600 mb-4">Load a template or select a task to see its checklist.</p>
                    <Button onClick={() => setShowTemplates(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Load Template
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai-tasks" className="mt-6">
            <AITaskAssignment projectId={projectId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Template Selection Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Add Phases to Project</h2>
                      <p className="text-gray-600">Select phases and documents to add to your project schedule</p>
                      {scheduleTasks.length > 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          ⚠️ Schedule already has {scheduleTasks.length} tasks. New phases will be added to existing ones.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {scheduleTasks.length > 0 && (
                        <Button 
                          variant="outline"
                          onClick={handleClearSchedule}
                          className="text-red-600 hover:text-red-800 border-red-300"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Schedule
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowTemplates(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
            
            <ProjectPlanningTemplates
              projectCategory={project.category}
              onTemplateSelect={handleTemplateSelection}
              onClose={() => setShowTemplates(false)}
              previouslySelectedPhases={currentSchedule?.selectedPhases}
              previouslySelectedDocuments={currentSchedule?.selectedDocuments}
              isAddMode={!!currentSchedule}
              existingTasks={scheduleTasks}
            />
          </div>
        </div>
      )}
    </div>
  );
}
