import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Target,
  Zap,
  TrendingUp,
  Users
} from 'lucide-react';

interface AITaskAssignmentProps {
  projectId: string;
}

interface AITask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  dueDate?: string;
  estimatedHours: number;
  actualHours?: number;
  category: string;
  aiConfidence: number;
  createdAt: string;
}

function AITaskAssignment({ projectId }: AITaskAssignmentProps) {
  const [tasks, setTasks] = useState<AITask[]>([
    {
      id: 'task-1',
      title: 'Review Budget Allocation',
      description: 'AI suggests reviewing current budget distribution across project phases',
      priority: 'high',
      status: 'pending',
      assignedTo: 'john.doe@rdc.gov',
      dueDate: '2024-10-20',
      estimatedHours: 4,
      category: 'Financial',
      aiConfidence: 92,
      createdAt: '2024-10-15T10:00:00Z'
    },
    {
      id: 'task-2',
      title: 'Risk Assessment Update',
      description: 'Update risk register based on recent project developments',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'sarah.smith@rdc.gov',
      dueDate: '2024-10-18',
      estimatedHours: 6,
      actualHours: 3,
      category: 'Risk Management',
      aiConfidence: 88,
      createdAt: '2024-10-14T14:30:00Z'
    },
    {
      id: 'task-3',
      title: 'Stakeholder Communication',
      description: 'Schedule weekly check-in with key stakeholders',
      priority: 'medium',
      status: 'completed',
      assignedTo: 'mike.johnson@rdc.gov',
      dueDate: '2024-10-16',
      estimatedHours: 2,
      actualHours: 2,
      category: 'Communication',
      aiConfidence: 95,
      createdAt: '2024-10-13T09:15:00Z'
    },
    {
      id: 'task-4',
      title: 'Quality Assurance Review',
      description: 'Conduct quality review of completed deliverables',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-10-22',
      estimatedHours: 8,
      category: 'Quality',
      aiConfidence: 85,
      createdAt: '2024-10-15T11:20:00Z'
    }
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = (task: AITask) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'in_progress' && task.actualHours) {
      return Math.min((task.actualHours / task.estimatedHours) * 100, 100);
    }
    return 0;
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      {/* AI Task Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Brain className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <CardTitle>AI Task Assignment</CardTitle>
                <p className="text-sm text-gray-600">Intelligent task recommendations and automated assignments</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Generate New Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Pending Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>AI Insights & Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Resource Optimization</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    AI suggests reassigning 2 team members from low-priority tasks to critical path activities.
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800">Confidence: 89%</Badge>
                    <Button size="sm" variant="outline">Apply Suggestion</Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Timeline Optimization</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Parallel execution of tasks 3 and 4 could reduce project duration by 3 days.
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-green-100 text-green-800">Confidence: 94%</Badge>
                    <Button size="sm" variant="outline">Optimize Schedule</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">AI-Generated Tasks</h3>
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      AI: {task.aiConfidence}%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {task.dueDate ? formatDate(task.dueDate) : 'No due date'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{task.estimatedHours}h estimated</span>
                      {task.actualHours && (
                        <span className="text-gray-400">• {task.actualHours}h actual</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{task.assignedTo || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4" />
                      <span>{task.category}</span>
                    </div>
                  </div>
                  
                  {task.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round(calculateProgress(task))}%</span>
                      </div>
                      <Progress value={calculateProgress(task)} className="h-2" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {task.status === 'pending' && (
                    <Button size="sm" variant="outline">
                      <User className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  )}
                  {task.status === 'in_progress' && (
                    <Button size="sm" variant="outline">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Task Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Generate New AI Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              AI can analyze your project data and generate intelligent task recommendations based on:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Project timeline and milestones</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Resource availability and workload</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Risk factors and dependencies</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Historical project patterns</span>
              </div>
            </div>
            <Button className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Task Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AITaskAssignment;