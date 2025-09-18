import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Flag,
  Target,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface RAIDDashboardProps {
  projectId: string;
}

interface RAIDItem {
  id: string;
  type: 'risk' | 'assumption' | 'issue' | 'dependency';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  impact?: 'low' | 'medium' | 'high';
  probability?: 'low' | 'medium' | 'high';
}

export default function RAIDDashboard({ projectId }: RAIDDashboardProps) {
  const [activeTab, setActiveTab] = useState('risks');
  const [showAddForm, setShowAddForm] = useState(false);

  const raidItems: RAIDItem[] = [
    {
      id: 'risk-1',
      type: 'risk',
      title: 'Budget Overrun Risk',
      description: 'Potential for budget overrun due to scope creep and inflation',
      status: 'open',
      priority: 'high',
      assignedTo: 'john.doe@rdc.gov',
      dueDate: '2024-10-25',
      createdAt: '2024-10-10T09:00:00Z',
      updatedAt: '2024-10-15T14:30:00Z',
      impact: 'high',
      probability: 'medium'
    },
    {
      id: 'assumption-1',
      type: 'assumption',
      title: 'Weather Conditions',
      description: 'Assuming favorable weather conditions for outdoor construction',
      status: 'open',
      priority: 'medium',
      assignedTo: 'sarah.smith@rdc.gov',
      createdAt: '2024-10-08T10:15:00Z',
      updatedAt: '2024-10-12T11:20:00Z'
    },
    {
      id: 'issue-1',
      type: 'issue',
      title: 'Permit Delays',
      description: 'Construction permits are taking longer than expected',
      status: 'in_progress',
      priority: 'critical',
      assignedTo: 'mike.johnson@rdc.gov',
      dueDate: '2024-10-20',
      createdAt: '2024-10-05T08:30:00Z',
      updatedAt: '2024-10-15T16:45:00Z'
    },
    {
      id: 'dependency-1',
      type: 'dependency',
      title: 'Utility Relocation',
      description: 'Project depends on utility company relocating power lines',
      status: 'open',
      priority: 'high',
      assignedTo: 'lisa.wilson@rdc.gov',
      dueDate: '2024-11-01',
      createdAt: '2024-10-01T12:00:00Z',
      updatedAt: '2024-10-14T09:15:00Z'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'assumption': return <Info className="h-4 w-4 text-blue-600" />;
      case 'issue': return <Flag className="h-4 w-4 text-orange-600" />;
      case 'dependency': return <Target className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-red-100 text-red-800';
      case 'assumption': return 'bg-blue-100 text-blue-800';
      case 'issue': return 'bg-orange-100 text-orange-800';
      case 'dependency': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  const getRiskMatrixColor = (impact: string, probability: string) => {
    if (impact === 'high' && probability === 'high') return 'bg-red-500';
    if (impact === 'high' && probability === 'medium') return 'bg-orange-500';
    if (impact === 'medium' && probability === 'high') return 'bg-orange-500';
    if (impact === 'high' && probability === 'low') return 'bg-yellow-500';
    if (impact === 'medium' && probability === 'medium') return 'bg-yellow-500';
    if (impact === 'low' && probability === 'high') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const risks = raidItems.filter(item => item.type === 'risk');
  const assumptions = raidItems.filter(item => item.type === 'assumption');
  const issues = raidItems.filter(item => item.type === 'issue');
  const dependencies = raidItems.filter(item => item.type === 'dependency');

  const renderRAIDItems = (items: RAIDItem[]) => (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getTypeIcon(item.type)}
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <Badge className={getTypeColor(item.type)}>
                    {item.type.toUpperCase()}
                  </Badge>
                  <Badge className={getPriorityColor(item.priority)}>
                    {item.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  {item.assignedTo && (
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{item.assignedTo}</span>
                    </div>
                  )}
                  {item.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(item.dueDate)}</span>
                    </div>
                  )}
                  {item.impact && item.probability && (
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskMatrixColor(item.impact, item.probability)}`}></div>
                      <span>Risk: {item.impact} impact, {item.probability} probability</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* RAID Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
            <div>
                <CardTitle>RAID Dashboard</CardTitle>
                <p className="text-sm text-gray-600">Risks, Assumptions, Issues, and Dependencies</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
              </Button>
          </div>
        </CardHeader>
      </Card>

      {/* RAID Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{risks.length}</div>
                <div className="text-sm text-gray-600">Risks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{assumptions.length}</div>
                <div className="text-sm text-gray-600">Assumptions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flag className="h-6 w-6 text-orange-600" />
                </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{issues.length}</div>
                <div className="text-sm text-gray-600">Issues</div>
                  </div>
                  </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{dependencies.length}</div>
                <div className="text-sm text-gray-600">Dependencies</div>
              </div>
            </div>
          </CardContent>
        </Card>
                </div>
                
      {/* RAID Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="assumptions">Assumptions</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Project Risks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRAIDItems(risks)}
            </CardContent>
          </Card>
              </TabsContent>

        <TabsContent value="assumptions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span>Project Assumptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRAIDItems(assumptions)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="h-5 w-5 text-orange-600" />
                <span>Project Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRAIDItems(issues)}
            </CardContent>
          </Card>
              </TabsContent>

        <TabsContent value="dependencies" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span>Project Dependencies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderRAIDItems(dependencies)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Risk Matrix</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div></div>
              <div className="text-sm font-medium">Low Probability</div>
              <div className="text-sm font-medium">Medium Probability</div>
              <div className="text-sm font-medium">High Probability</div>
                </div>
                
            <div className="grid grid-cols-4 gap-4">
              <div className="text-sm font-medium flex items-center">High Impact</div>
              <div className="h-16 bg-yellow-500 rounded flex items-center justify-center text-white font-medium">Medium</div>
              <div className="h-16 bg-orange-500 rounded flex items-center justify-center text-white font-medium">High</div>
              <div className="h-16 bg-red-500 rounded flex items-center justify-center text-white font-medium">Critical</div>
                  </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-sm font-medium flex items-center">Medium Impact</div>
              <div className="h-16 bg-green-500 rounded flex items-center justify-center text-white font-medium">Low</div>
              <div className="h-16 bg-yellow-500 rounded flex items-center justify-center text-white font-medium">Medium</div>
              <div className="h-16 bg-orange-500 rounded flex items-center justify-center text-white font-medium">High</div>
                  </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="text-sm font-medium flex items-center">Low Impact</div>
              <div className="h-16 bg-green-500 rounded flex items-center justify-center text-white font-medium">Low</div>
              <div className="h-16 bg-green-500 rounded flex items-center justify-center text-white font-medium">Low</div>
              <div className="h-16 bg-yellow-500 rounded flex items-center justify-center text-white font-medium">Medium</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}