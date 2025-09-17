import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, DollarSign, User, AlertCircle, CheckCircle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
}

interface ProjectTableProps {
  projects: Project[];
}

const ProjectTable: React.FC<ProjectTableProps> = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusInfo = (project: Project) => {
    const now = new Date();
    const plannedStart = new Date(project.plannedStartDate);
    const plannedEnd = new Date(project.plannedEndDate);
    const actualStart = project.actualStartDate ? new Date(project.actualStartDate) : null;
    const actualEnd = project.actualEndDate ? new Date(project.actualEndDate) : null;

    // Determine status based on dates and progress
    if (project.status === 'completed') {
      return { text: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    
    if (project.status === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    
    if (project.status === 'on_hold') {
      return { text: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }

    if (project.status === 'initiate') {
      return { text: 'Initiate', color: 'bg-purple-100 text-purple-800', icon: Info };
    }

    if (project.status === 'planning') {
      return { text: 'Planning', color: 'bg-blue-100 text-blue-800', icon: Info };
    }

    // For in_progress projects, check for delays
    if (actualStart && actualStart > plannedStart) {
      return { text: 'Start - Delayed', color: 'bg-orange-100 text-orange-800', icon: AlertCircle };
    }
    
    if (now > plannedEnd && !actualEnd) {
      return { text: 'Finish - Delayed', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
    
    if (project.progressPercentage > 75 && now < plannedEnd) {
      return { text: 'Ahead of Schedule', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
    
    return { text: 'On Track', color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
  };

  const getBudgetStatus = (project: Project) => {
    const spentPercentage = (project.budgetSpent / project.budgetAllocated) * 100;
    if (spentPercentage > 100) return 'Over Budget';
    if (spentPercentage > 90) return 'Near Budget Limit';
    return 'On Budget';
  };

  const getNextMilestone = (project: Project) => {
    // Simple milestone logic based on progress
    if (project.progressPercentage < 25) return 'Initial Setup';
    if (project.progressPercentage < 50) return 'Foundation Work';
    if (project.progressPercentage < 75) return 'Main Construction';
    if (project.progressPercentage < 90) return 'Final Phase';
    return 'Project Completion';
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">#</th>
              <th className="sticky left-0 z-10 text-left p-3 font-medium text-sm text-muted-foreground bg-background border-r min-w-[120px]">Code</th>
              <th className="sticky left-[120px] z-10 text-left p-3 font-medium text-sm text-muted-foreground bg-background border-r min-w-[200px]">Project</th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">Planned Start</th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">Planned Finish</th>
              <th className="text-left p-3 font-medium text-sm text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const statusInfo = getStatusInfo(project);
              const StatusIcon = statusInfo.icon;
              
              return (
                <tr key={project.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 text-sm text-muted-foreground">{index + 1}</td>
                  <td className="sticky left-0 z-10 p-3 bg-background border-r min-w-[120px]">
                    <div className="font-medium text-blue-600">{project.code || 'No Code'}</div>
                    <div className="text-xs text-muted-foreground">ID: {project.id}</div>
                  </td>
                  <td className="sticky left-[120px] z-10 p-3 bg-background border-r min-w-[200px]">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">{project.category}</div>
                  </td>
                  <td className="p-3 text-sm">{formatDate(project.plannedStartDate)}</td>
                  <td className="p-3 text-sm">{formatDate(project.plannedEndDate)}</td>
                  <td className="p-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => setSelectedProject(project)}
                        >
                          <Badge className={`${statusInfo.color} cursor-pointer hover:opacity-80`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.text}
                          </Badge>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{project.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Project Details</h4>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                Timeline
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>Planned Start: {formatDate(project.plannedStartDate)}</div>
                                <div>Planned Finish: {formatDate(project.plannedEndDate)}</div>
                                {project.actualStartDate && (
                                  <div>Actual Start: {formatDate(project.actualStartDate)}</div>
                                )}
                                {project.actualEndDate && (
                                  <div>Actual Finish: {formatDate(project.actualEndDate)}</div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2 flex items-center">
                                <DollarSign className="w-4 h-4 mr-2" />
                                Budget
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div>Allocated: {project.currency} {project.budgetAllocated.toLocaleString()}</div>
                                <div>Spent: {project.currency} {project.budgetSpent.toLocaleString()}</div>
                                <div className="text-muted-foreground">{getBudgetStatus(project)}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Progress</h4>
                            <div className="space-y-2">
                              <Progress value={project.progressPercentage} className="h-2" />
                              <div className="flex justify-between text-sm">
                                <span>{project.progressPercentage}% Complete</span>
                                <span className="text-muted-foreground">Next: {getNextMilestone(project)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Category:</span> {project.category}
                            </div>
                            <div>
                              <span className="font-medium">Priority:</span> {project.priority}
                            </div>
                            <div>
                              <span className="font-medium">Scope:</span> {project.scope}
                            </div>
                            <div>
                              <span className="font-medium">Funding:</span> {project.fundingSource}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {projects.map((project, index) => {
          const statusInfo = getStatusInfo(project);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={project.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{project.code || 'No Code'}</p>
                    <p className="text-sm text-muted-foreground">{project.category}</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        <Badge className={`${statusInfo.color} cursor-pointer`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{project.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Project Details</h4>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Timeline
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>Planned Start: {formatDate(project.plannedStartDate)}</div>
                              <div>Planned Finish: {formatDate(project.plannedEndDate)}</div>
                              {project.actualStartDate && (
                                <div>Actual Start: {formatDate(project.actualStartDate)}</div>
                              )}
                              {project.actualEndDate && (
                                <div>Actual Finish: {formatDate(project.actualEndDate)}</div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2 flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Budget
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div>Allocated: {project.currency} {project.budgetAllocated.toLocaleString()}</div>
                              <div>Spent: {project.currency} {project.budgetSpent.toLocaleString()}</div>
                              <div className="text-muted-foreground">{getBudgetStatus(project)}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Progress</h4>
                          <div className="space-y-2">
                            <Progress value={project.progressPercentage} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>{project.progressPercentage}% Complete</span>
                              <span className="text-muted-foreground">Next: {getNextMilestone(project)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Category:</span> {project.category}
                          </div>
                          <div>
                            <span className="font-medium">Priority:</span> {project.priority}
                          </div>
                          <div>
                            <span className="font-medium">Scope:</span> {project.scope}
                          </div>
                          <div>
                            <span className="font-medium">Funding:</span> {project.fundingSource}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(project.plannedStartDate)} - {formatDate(project.plannedEndDate)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTable;
