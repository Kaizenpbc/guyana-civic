import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  Clock,
  User,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';

interface SmartResourceAllocationProps {
  projectId: string;
}

interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  currentAllocation: number;
  maxCapacity: number;
  skills: string[];
  availability: 'available' | 'busy' | 'overloaded';
  utilization: number;
  lastUpdated: string;
}

export default function SmartResourceAllocation({ projectId }: SmartResourceAllocationProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  
  const resources: Resource[] = [
    {
      id: 'res-1',
      name: 'John Doe',
      role: 'Project Manager',
      department: 'Engineering',
      currentAllocation: 80,
      maxCapacity: 100,
      skills: ['Project Management', 'Agile', 'Risk Management'],
      availability: 'busy',
      utilization: 80,
      lastUpdated: '2024-10-15T10:30:00Z'
    },
    {
      id: 'res-2',
      name: 'Sarah Smith',
      role: 'Senior Developer',
      department: 'Engineering',
      currentAllocation: 60,
      maxCapacity: 100,
      skills: ['React', 'TypeScript', 'Node.js'],
      availability: 'available',
      utilization: 60,
      lastUpdated: '2024-10-15T09:15:00Z'
    },
    {
      id: 'res-3',
      name: 'Mike Johnson',
      role: 'DevOps Engineer',
      department: 'Engineering',
      currentAllocation: 90,
      maxCapacity: 100,
      skills: ['AWS', 'Docker', 'Kubernetes'],
      availability: 'overloaded',
      utilization: 90,
      lastUpdated: '2024-10-15T08:45:00Z'
    },
    {
      id: 'res-4',
      name: 'Lisa Wilson',
      role: 'UI/UX Designer',
      department: 'Design',
      currentAllocation: 70,
      maxCapacity: 100,
      skills: ['Figma', 'Adobe XD', 'User Research'],
      availability: 'busy',
      utilization: 70,
      lastUpdated: '2024-10-15T11:20:00Z'
    }
  ];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'overloaded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.availability === 'available').length;
  const overloadedResources = resources.filter(r => r.availability === 'overloaded').length;
  const averageUtilization = resources.reduce((sum, r) => sum + r.utilization, 0) / totalResources;

  return (
    <div className="space-y-6">
      {/* Resource Allocation Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Smart Resource Allocation</CardTitle>
                <p className="text-sm text-gray-600">AI-powered team optimization and workload management</p>
              </div>
            </div>
            <Button>
              <Zap className="h-4 w-4 mr-2" />
              Optimize Allocation
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Resource Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalResources}</div>
                <div className="text-sm text-gray-600">Total Resources</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{availableResources}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{overloadedResources}</div>
                <div className="text-sm text-gray-600">Overloaded</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{averageUtilization.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Avg Utilization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            <span>Resource Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{resource.name}</h4>
                          <p className="text-sm text-gray-600">{resource.role} • {resource.department}</p>
                        </div>
                        <Badge className={getAvailabilityColor(resource.availability)}>
                          {resource.availability.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{resource.currentAllocation}% allocated</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="h-4 w-4" />
                          <span>Max: {resource.maxCapacity}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Updated: {formatDate(resource.lastUpdated)}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Utilization</span>
                          <span className={getUtilizationColor(resource.utilization)}>
                            {resource.utilization}%
                          </span>
                        </div>
                        <Progress value={resource.utilization} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {resource.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button size="sm" variant="outline">
                        Reallocate
                      </Button>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span>AI Optimization Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Redistribute Workload</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Move 20% of Mike Johnson's workload to Sarah Smith to balance utilization and reduce overload.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Skill-Based Assignment</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Assign React tasks to Sarah Smith and DevOps tasks to Mike Johnson for optimal skill utilization.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Optimize Assignments
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Team Collaboration</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Pair Lisa Wilson with Sarah Smith for design-development collaboration to improve efficiency.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Enable Collaboration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}