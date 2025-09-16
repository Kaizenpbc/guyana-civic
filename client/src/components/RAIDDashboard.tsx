import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Plus,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { 
  getProjectRisks, 
  getProjectIssues, 
  getProjectDecisions, 
  getProjectActions,
  getStatusColor,
  getPriorityColor,
  ProjectRisk,
  ProjectIssue,
  ProjectDecision,
  ProjectAction
} from '../api/risk-management-api';
import RAIDItemDetails from './RAIDItemDetails';

interface RAIDDashboardProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
  onAddNew: (type: 'risk' | 'issue' | 'decision' | 'action') => void;
}

const RAIDDashboard: React.FC<RAIDDashboardProps> = ({ 
  projectId, 
  projectName, 
  onClose, 
  onAddNew 
}) => {
  const [risks, setRisks] = useState<ProjectRisk[]>([]);
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [decisions, setDecisions] = useState<ProjectDecision[]>([]);
  const [actions, setActions] = useState<ProjectAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectRisk | ProjectIssue | ProjectDecision | ProjectAction | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'risk' | 'issue' | 'decision' | 'action' | null>(null);

  useEffect(() => {
    loadRAIDData();
  }, [projectId]);

  const loadRAIDData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [risksData, issuesData, decisionsData, actionsData] = await Promise.all([
        getProjectRisks(projectId),
        getProjectIssues(projectId),
        getProjectDecisions(projectId),
        getProjectActions(projectId)
      ]);

      setRisks(risksData.risks);
      setIssues(issuesData.issues);
      setDecisions(decisionsData.decisions);
      setActions(actionsData.actions);
    } catch (err) {
      setError('Failed to load RAID data');
      console.error('Error loading RAID data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleItemClick = (item: ProjectRisk | ProjectIssue | ProjectDecision | ProjectAction, type: 'risk' | 'issue' | 'decision' | 'action') => {
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
    setSelectedItemType(null);
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 4) return 'text-green-600 bg-green-100';
    if (score <= 8) return 'text-yellow-600 bg-yellow-100';
    if (score <= 12) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-6xl h-5/6">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading RAID data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-5/6 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">RAID Dashboard</CardTitle>
              <p className="text-gray-600 mt-1">{projectName}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          {error && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="risks" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="risks" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Risks ({risks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="issues" className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Issues ({issues.length})</span>
              </TabsTrigger>
              <TabsTrigger value="decisions" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Decisions ({decisions.length})</span>
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Actions ({actions.length})</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              {/* Risks Tab */}
              <TabsContent value="risks" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Project Risks</h3>
                  <Button onClick={() => onAddNew('risk')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Risk
                  </Button>
                </div>
                
                {risks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No risks identified for this project</p>
                    <Button onClick={() => onAddNew('risk')} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Risk
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {risks.map((risk) => (
                          <tr 
                            key={risk.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleItemClick(risk, 'risk')}
                          >
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{risk.description}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {risk.category}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getRiskScoreColor(risk.risk_score)}>
                                {risk.risk_score}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(risk.status)}>
                                {risk.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {risk.owner_id || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {risk.due_date ? formatDate(risk.due_date) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Project Issues</h3>
                  <Button onClick={() => onAddNew('issue')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Issue
                  </Button>
                </div>
                
                {issues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No issues reported for this project</p>
                    <Button onClick={() => onAddNew('issue')} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Issue
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {issues.map((issue) => (
                          <tr 
                            key={issue.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleItemClick(issue, 'issue')}
                          >
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{issue.description}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {issue.category}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(issue.priority)}>
                                {issue.priority}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(issue.status)}>
                                {issue.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.owner_id || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.due_date ? formatDate(issue.due_date) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Decisions Tab */}
              <TabsContent value="decisions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Project Decisions</h3>
                  <Button onClick={() => onAddNew('decision')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Decision
                  </Button>
                </div>
                
                {decisions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No decisions recorded for this project</p>
                    <Button onClick={() => onAddNew('decision')} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Decision
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Decision Maker</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Implementation Deadline</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {decisions.map((decision) => (
                          <tr 
                            key={decision.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleItemClick(decision, 'decision')}
                          >
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{decision.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{decision.description}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {decision.decision_type}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(decision.decision_status)}>
                                {decision.decision_status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {decision.decision_maker || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {decision.implementation_deadline ? formatDate(decision.implementation_deadline) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              {/* Actions Tab */}
              <TabsContent value="actions" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Project Actions</h3>
                  <Button onClick={() => onAddNew('action')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                {actions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No actions assigned for this project</p>
                    <Button onClick={() => onAddNew('action')} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Action
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {actions.map((action) => (
                          <tr 
                            key={action.id} 
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleItemClick(action, 'action')}
                          >
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{action.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{action.description}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {action.action_type}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge className={getStatusColor(action.status)}>
                                {action.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {action.assigned_to || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {action.due_date ? formatDate(action.due_date) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* RAID Item Details Modal */}
      {selectedItem && selectedItemType && (
        <RAIDItemDetails
          item={selectedItem}
          type={selectedItemType}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default RAIDDashboard;
