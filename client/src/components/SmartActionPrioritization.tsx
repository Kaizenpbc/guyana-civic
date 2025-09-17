import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  DollarSign,
  Target,
  Brain,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  RefreshCw,
  Play,
  UserPlus,
  Calendar,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'schedule' | 'risk' | 'issue' | 'decision' | 'action';
  priority_score: number;
  urgency_level: 'critical' | 'high' | 'medium' | 'low';
  impact_score: number;
  risk_score: number;
  blocking_count: number;
  deadline?: string;
  estimated_effort: number; // hours
  assigned_to?: string;
  project_id: string;
  project_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  created_at: string;
  ai_reasoning: string;
  dependencies: string[];
  cost_impact?: number;
  quality_impact?: number;
  schedule_impact?: number;
}

interface SmartActionPrioritizationProps {
  projectId?: string;
  project?: any;
  onClose: () => void;
}

const SmartActionPrioritization: React.FC<SmartActionPrioritizationProps> = ({ 
  projectId, 
  project,
  onClose 
}) => {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'urgency' | 'impact' | 'deadline'>('priority');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);

  // Generate mock action items from different sources
  const generateActionItems = (): ActionItem[] => {
    const baseItems: ActionItem[] = [
      // Project Schedule Tasks
      {
        id: 'schedule-1',
        title: 'Pour Concrete Foundation',
        description: 'Complete foundation pour for main building structure',
        type: 'schedule',
        priority_score: 8,
        urgency_level: 'high',
        impact_score: 9,
        risk_score: 6,
        blocking_count: 3,
        deadline: '2024-02-15',
        estimated_effort: 16,
        assigned_to: 'Construction Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-15',
        ai_reasoning: 'Critical path item blocking 3 downstream activities. Weather window closing.',
        dependencies: ['site-prep-1', 'materials-1'],
        cost_impact: 50000,
        quality_impact: 9,
        schedule_impact: 8
      },
      {
        id: 'schedule-2',
        title: 'Install Electrical Systems',
        description: 'Complete electrical installation and testing',
        type: 'schedule',
        priority_score: 6,
        urgency_level: 'medium',
        impact_score: 7,
        risk_score: 4,
        blocking_count: 2,
        deadline: '2024-03-01',
        estimated_effort: 24,
        assigned_to: 'Electrical Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-20',
        ai_reasoning: 'Standard schedule item with moderate dependencies.',
        dependencies: ['foundation-1'],
        cost_impact: 30000,
        quality_impact: 8,
        schedule_impact: 6
      },
      // Risk Management Actions
      {
        id: 'risk-1',
        title: 'Mitigate Weather Delay Risk',
        description: 'Implement weather monitoring and backup plans',
        type: 'risk',
        priority_score: 9,
        urgency_level: 'critical',
        impact_score: 8,
        risk_score: 9,
        blocking_count: 5,
        deadline: '2024-01-25',
        estimated_effort: 8,
        assigned_to: 'Project Manager',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-22',
        ai_reasoning: 'High probability weather event could delay entire project by 2 weeks.',
        dependencies: [],
        cost_impact: 100000,
        quality_impact: 7,
        schedule_impact: 9
      },
      {
        id: 'risk-2',
        title: 'Order Backup Materials',
        description: 'Secure backup material suppliers for critical components',
        type: 'risk',
        priority_score: 7,
        urgency_level: 'high',
        impact_score: 6,
        risk_score: 7,
        blocking_count: 2,
        deadline: '2024-02-01',
        estimated_effort: 4,
        assigned_to: 'Procurement Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-23',
        ai_reasoning: 'Supply chain disruption risk requires backup suppliers.',
        dependencies: [],
        cost_impact: 25000,
        quality_impact: 6,
        schedule_impact: 7
      },
      // Issue Resolution Tasks
      {
        id: 'issue-1',
        title: 'Fix Broken Equipment',
        description: 'Repair excavator that broke down during site preparation',
        type: 'issue',
        priority_score: 8,
        urgency_level: 'high',
        impact_score: 7,
        risk_score: 5,
        blocking_count: 4,
        deadline: '2024-01-26',
        estimated_effort: 12,
        assigned_to: 'Equipment Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'in_progress',
        created_at: '2024-01-24',
        ai_reasoning: 'Equipment failure blocking 4 critical activities. Immediate action required.',
        dependencies: [],
        cost_impact: 15000,
        quality_impact: 5,
        schedule_impact: 8
      },
      {
        id: 'issue-2',
        title: 'Resolve Permit Delays',
        description: 'Expedite building permit approval process',
        type: 'issue',
        priority_score: 6,
        urgency_level: 'medium',
        impact_score: 8,
        risk_score: 6,
        blocking_count: 1,
        deadline: '2024-02-10',
        estimated_effort: 6,
        assigned_to: 'Compliance Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-25',
        ai_reasoning: 'Permit delays could impact project start date.',
        dependencies: [],
        cost_impact: 20000,
        quality_impact: 8,
        schedule_impact: 7
      },
      // Decision Follow-up Actions
      {
        id: 'decision-1',
        title: 'Implement Design Change',
        description: 'Update foundation design based on approved change order',
        type: 'decision',
        priority_score: 7,
        urgency_level: 'high',
        impact_score: 6,
        risk_score: 4,
        blocking_count: 2,
        deadline: '2024-02-05',
        estimated_effort: 8,
        assigned_to: 'Design Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-26',
        ai_reasoning: 'Approved design change requires immediate implementation.',
        dependencies: ['approval-1'],
        cost_impact: 35000,
        quality_impact: 8,
        schedule_impact: 5
      },
      {
        id: 'decision-2',
        title: 'Update Project Budget',
        description: 'Revise budget allocation based on recent decisions',
        type: 'decision',
        priority_score: 5,
        urgency_level: 'medium',
        impact_score: 5,
        risk_score: 3,
        blocking_count: 0,
        deadline: '2024-02-15',
        estimated_effort: 4,
        assigned_to: 'Finance Team',
        project_id: projectId || '1',
        project_name: project?.name || 'Sample Project',
        status: 'pending',
        created_at: '2024-01-27',
        ai_reasoning: 'Budget updates needed for accurate project tracking.',
        dependencies: [],
        cost_impact: 0,
        quality_impact: 6,
        schedule_impact: 3
      }
    ];

    return baseItems;
  };

  // AI-powered prioritization analysis
  const analyzePriorities = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const items = generateActionItems();
    
    // AI prioritization logic
    const prioritizedItems = items.map(item => {
      let priorityScore = 0;
      let reasoning = '';
      
      // Base score from impact and risk
      priorityScore += item.impact_score * 0.3;
      priorityScore += item.risk_score * 0.25;
      
      // Urgency multiplier
      const urgencyMultiplier = {
        'critical': 1.5,
        'high': 1.2,
        'medium': 1.0,
        'low': 0.8
      };
      priorityScore *= urgencyMultiplier[item.urgency_level];
      
      // Blocking count bonus
      priorityScore += item.blocking_count * 0.5;
      
      // Deadline pressure
      if (item.deadline) {
        const daysUntilDeadline = Math.ceil((new Date(item.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDeadline <= 3) priorityScore += 2;
        else if (daysUntilDeadline <= 7) priorityScore += 1;
      }
      
      // Type-specific adjustments
      if (item.type === 'issue') priorityScore += 1; // Issues need immediate attention
      if (item.type === 'risk') priorityScore += 0.5; // Risks are important
      
      // Generate AI reasoning
      reasoning = `Priority ${Math.round(priorityScore)}: `;
      if (item.blocking_count > 0) reasoning += `Blocking ${item.blocking_count} other tasks. `;
      if (item.urgency_level === 'critical') reasoning += 'Critical urgency. ';
      if (item.risk_score > 7) reasoning += 'High risk impact. ';
      if (item.impact_score > 7) reasoning += 'High project impact. ';
      reasoning += item.ai_reasoning;
      
      return {
        ...item,
        priority_score: Math.min(10, Math.round(priorityScore)),
        ai_reasoning: reasoning
      };
    });
    
    // Sort by priority score
    prioritizedItems.sort((a, b) => b.priority_score - a.priority_score);
    
    setActionItems(prioritizedItems);
    setIsAnalyzing(false);
    setShowAnalysis(true);
  };

  useEffect(() => {
    if (projectId || project) {
      analyzePriorities();
    }
  }, [projectId, project]);

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Minus className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Target className="h-4 w-4 text-blue-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'issue': return <Zap className="h-4 w-4 text-orange-600" />;
      case 'decision': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'action': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredItems = actionItems.filter(item => 
    filterType === 'all' || item.type === filterType
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'priority': return b.priority_score - a.priority_score;
      case 'urgency': 
        const urgencyOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return urgencyOrder[b.urgency_level] - urgencyOrder[a.urgency_level];
      case 'impact': return b.impact_score - a.impact_score;
      case 'deadline': 
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default: return 0;
    }
  });

  const toggleRowExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const handleStartTask = (item: ActionItem) => {
    console.log('Starting task:', item.title);
    // Implementation for starting task
  };

  const handleAssignTask = (item: ActionItem) => {
    console.log('Assigning task:', item.title);
    // Implementation for assigning task
  };

  const handleScheduleTask = (item: ActionItem) => {
    console.log('Scheduling task:', item.title);
    // Implementation for scheduling task
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">🎯 Smart Action Prioritization</h2>
              <p className="text-sm text-gray-600">
                AI-prioritized tasks for {project?.name || 'Project'} • Click rows for details
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={analyzePriorities}
                disabled={isAnalyzing}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Re-analyze
                  </>
                )}
              </Button>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-3 py-1 text-sm"
              >
                <option value="all">All Types</option>
                <option value="schedule">Schedule</option>
                <option value="risk">Risk</option>
                <option value="issue">Issue</option>
                <option value="decision">Decision</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              {sortedItems.length} items • Sorted by {sortBy}
            </div>
          </div>

          {/* Quick Analysis Status */}
          {isAnalyzing && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-600 animate-pulse" />
                <span className="text-sm text-purple-800">AI analyzing priorities...</span>
              </div>
            </div>
          )}

          {/* Priority Table */}
          {showAnalysis && !isAnalyzing && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impact/Risk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Urgency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blocking
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <Target className="h-8 w-8 text-gray-400" />
                          <p>No action items found for the selected filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedItems.map((item, index) => (
                      <React.Fragment key={item.id}>
                        <tr 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleRowExpansion(item.id)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Badge className={`${getPriorityColor(item.priority_score)} font-bold text-sm`}>
                                #{index + 1}
                              </Badge>
                              <span className="font-bold text-lg">{item.priority_score}/10</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              {expandedRows.has(item.id) ? (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                  {item.title}
                                </div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(item.type)}
                              <span className="text-sm capitalize">{item.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Impact:</span>
                                <span>{item.impact_score}/10</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Risk:</span>
                                <span>{item.risk_score}/10</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {getUrgencyIcon(item.urgency_level)}
                              <span className="text-sm capitalize">{item.urgency_level}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {item.blocking_count > 0 ? (
                              <Badge variant="outline" className="text-red-600 border-red-200">
                                {item.blocking_count} tasks
                              </Badge>
                            ) : (
                              <span className="text-sm text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTask(item);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-xs"
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignTask(item);
                                }}
                                className="text-xs"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRows.has(item.id) && (
                          <tr>
                            <td colSpan={7} className="px-4 py-4 bg-gray-50">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Details</h4>
                                    <div className="text-sm space-y-1">
                                      <div><span className="font-medium">Effort:</span> {item.estimated_effort} hours</div>
                                      <div><span className="font-medium">Assigned:</span> {item.assigned_to || 'Unassigned'}</div>
                                      {item.deadline && (
                                        <div>
                                          <span className="font-medium">Deadline:</span> 
                                          <span className={`ml-1 ${
                                            new Date(item.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) 
                                              ? 'text-red-600 font-semibold' 
                                              : 'text-gray-900'
                                          }`}>
                                            {new Date(item.deadline).toLocaleDateString()}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Impact Analysis</h4>
                                    <div className="text-sm space-y-1">
                                      {item.cost_impact && (
                                        <div><span className="font-medium">Cost Impact:</span> ${item.cost_impact.toLocaleString()}</div>
                                      )}
                                      <div><span className="font-medium">Quality Impact:</span> {item.quality_impact}/10</div>
                                      <div><span className="font-medium">Schedule Impact:</span> {item.schedule_impact}/10</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Dependencies</h4>
                                    <div className="text-sm">
                                      {item.dependencies.length > 0 ? (
                                        <ul className="list-disc list-inside space-y-1">
                                          {item.dependencies.map((dep, idx) => (
                                            <li key={idx} className="text-gray-600">{dep}</li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <span className="text-gray-500">No dependencies</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-white p-3 rounded border border-purple-200">
                                  <h4 className="font-medium text-purple-900 mb-1">🧠 AI Reasoning</h4>
                                  <p className="text-sm text-purple-800">{item.ai_reasoning}</p>
                                </div>
                                
                                <div className="flex space-x-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartTask(item)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    Start Task
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAssignTask(item)}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign Team
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleScheduleTask(item)}
                                  >
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Schedule
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartActionPrioritization;
