import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Play, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'initiate' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progressPercentage: number;
  category: string;
  priority: string;
  plannedStartDate: string;
  plannedEndDate: string;
  assignedAt?: string;
  // Additional fields from API
  jurisdictionId?: string;
  scope?: string;
  fundingSource?: string;
  budgetAllocated?: number;
  budgetSpent?: number;
  currency?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  createdBy?: string;
  assignedTo?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ActiveProjectsCardProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

const ActiveProjectsCard: React.FC<ActiveProjectsCardProps> = ({ projects, onProjectClick }) => {
  const getStatusInfo = (project: Project) => {
    switch (project.status) {
      case 'initiate':
        return { 
          text: 'New Assignment', 
          color: 'bg-purple-100 text-purple-800', 
          icon: Info,
          description: 'Ready to start planning'
        };
      case 'planning':
        return { 
          text: 'Planning', 
          color: 'bg-blue-100 text-blue-800', 
          icon: Clock,
          description: 'Building project schedule'
        };
      case 'in_progress':
        return { 
          text: 'In Progress', 
          color: 'bg-green-100 text-green-800', 
          icon: Play,
          description: 'Active execution'
        };
      case 'on_hold':
        return { 
          text: 'On Hold', 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: AlertCircle,
          description: 'Temporarily paused'
        };
      default:
        return { 
          text: project.status, 
          color: 'bg-gray-100 text-gray-800', 
          icon: Info,
          description: 'Project status'
        };
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

  const activeProjects = projects.filter(p => 
    ['initiate', 'planning', 'in_progress', 'on_hold'].includes(p.status)
  );

  if (activeProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No active projects</p>
            <p className="text-sm">Projects assigned to you will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Active Projects ({activeProjects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeProjects.map((project) => {
            const statusInfo = getStatusInfo(project);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div 
                key={project.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onProjectClick(project)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.text}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category:</p>
                    <p className="font-medium capitalize">{project.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Timeline:</p>
                    <p className="font-medium">
                      {format(new Date(project.plannedStartDate), 'MMM dd')} - {format(new Date(project.plannedEndDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {project.status === 'in_progress' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {project.assignedAt && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Assigned: {format(new Date(project.assignedAt), 'MMM dd, yyyy')}
                  </div>
                )}

                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm">
                    {project.status === 'initiate' ? 'Start Planning' : 'View Details'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveProjectsCard;
