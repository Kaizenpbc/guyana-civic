import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Project {
  name: string;
  progress?: number;
  status?: string;
}

interface ProjectTrackerProps {
  projects: Project[];
}

const ProjectTracker: React.FC<ProjectTrackerProps> = ({ projects }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3">
      {projects.map((project, index) => (
        <div key={index} className="p-3 border rounded-lg bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">{project.name}</h4>
            {project.status && (
              <Badge variant="secondary" className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            )}
          </div>
          {project.progress !== undefined ? (
            <div className="space-y-1">
              <Progress value={project.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{project.progress}% complete</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Status: {project.status}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectTracker;
