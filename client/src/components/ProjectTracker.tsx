import React from 'react';

interface Project {
  name: string;
  progress?: number;
  status?: string;
}

interface ProjectTrackerProps {
  projects: Project[];
}

const ProjectTracker: React.FC<ProjectTrackerProps> = ({ projects }) => {
  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div key={index} className="bg-white p-4 rounded shadow-md">
          <h4 className="font-semibold">{project.name}</h4>
          {project.progress !== undefined ? (
            <div className="mt-2">
              <div className="bg-gray-200 h-2 rounded-full">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <p className="text-sm mt-1">{project.progress}% complete</p>
            </div>
          ) : (
            <p className="text-sm text-blue-600 mt-1">{project.status}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProjectTracker;
