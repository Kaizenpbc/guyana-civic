import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Calendar,
  DollarSign,
  Target,
  Brain,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface CrossProjectPattern {
  id: string;
  pattern_type: 'risk' | 'resource_conflict' | 'timeline_dependency' | 'budget_trend';
  title: string;
  description: string;
  affected_projects: string[];
  frequency: number; // percentage
  impact_score: number;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendation: string;
  urgency: 'high' | 'medium' | 'low';
  cost_impact?: number;
  timeline_impact?: number; // days
}

interface ResourceConflict {
  id: string;
  resource_type: string;
  resource_name: string;
  conflicting_projects: Array<{
    project_id: string;
    project_name: string;
    required_date: string;
    duration: number;
    priority: number;
  }>;
  resolution_options: string[];
  cost_to_resolve?: number;
}

interface CrossProjectInsight {
  id: string;
  insight_type: 'opportunity' | 'risk' | 'optimization';
  title: string;
  description: string;
  projects_involved: string[];
  potential_savings?: number;
  potential_acceleration?: number; // days
  implementation_effort: 'low' | 'medium' | 'high';
  confidence: number;
}

interface CrossProjectRiskAnalysisProps {
  userId: string;
  projects?: any[];
  onClose: () => void;
}

const CrossProjectRiskAnalysis: React.FC<CrossProjectRiskAnalysisProps> = ({ 
  userId, 
  projects = [],
  onClose 
}) => {
  const [patterns, setPatterns] = useState<CrossProjectPattern[]>([]);
  const [resourceConflicts, setResourceConflicts] = useState<ResourceConflict[]>([]);
  const [insights, setInsights] = useState<CrossProjectInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'patterns' | 'conflicts' | 'insights'>('patterns');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Generate mock data based on user's projects
  const generateCrossProjectAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate patterns based on project types
    const mockPatterns: CrossProjectPattern[] = [
      {
        id: 'pattern-weather',
        pattern_type: 'risk',
        title: 'Weather Delay Pattern',
        description: 'Weather-related delays affecting multiple infrastructure projects during rainy season',
        affected_projects: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'Coastal Protection Works'],
        frequency: 75,
        impact_score: 8,
        confidence: 92,
        trend: 'increasing',
        recommendation: 'Schedule outdoor work for dry season (Aug-Nov). Consider weather-resistant materials.',
        urgency: 'high',
        cost_impact: 45000,
        timeline_impact: 14
      },
      {
        id: 'pattern-equipment',
        pattern_type: 'resource_conflict',
        title: 'Equipment Sharing Bottleneck',
        description: 'Heavy equipment conflicts between infrastructure projects causing delays',
        affected_projects: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'New Berbice Bridge'],
        frequency: 60,
        impact_score: 7,
        confidence: 88,
        trend: 'stable',
        recommendation: 'Coordinate equipment schedules or lease additional excavator for peak periods.',
        urgency: 'medium',
        cost_impact: 25000,
        timeline_impact: 7
      },
      {
        id: 'pattern-permits',
        pattern_type: 'timeline_dependency',
        title: 'Permit Approval Dependencies',
        description: 'Environmental permit delays cascading across multiple projects',
        affected_projects: ['Coastal Protection Works', 'New Berbice Bridge'],
        frequency: 40,
        impact_score: 6,
        confidence: 85,
        trend: 'decreasing',
        recommendation: 'Start permit applications 6 weeks earlier. Engage regulatory liaison.',
        urgency: 'medium',
        cost_impact: 15000,
        timeline_impact: 21
      },
      {
        id: 'pattern-budget',
        pattern_type: 'budget_trend',
        title: 'Infrastructure Cost Overrun Trend',
        description: 'Infrastructure projects consistently trending 15-20% over initial budget',
        affected_projects: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'New Berbice Bridge', 'Community Center Upgrades'],
        frequency: 80,
        impact_score: 9,
        confidence: 95,
        trend: 'increasing',
        recommendation: 'Implement 20% contingency buffer. Review cost estimation methodology.',
        urgency: 'high',
        cost_impact: 150000,
        timeline_impact: 0
      }
    ];

    // Generate resource conflicts
    const mockConflicts: ResourceConflict[] = [
      {
        id: 'conflict-excavator',
        resource_type: 'Heavy Equipment',
        resource_name: 'CAT 320 Excavator',
        conflicting_projects: [
          {
            project_id: 'proj-pm-1',
            project_name: 'Anna Regina Sports Complex',
            required_date: '2024-02-15',
            duration: 5,
            priority: 8
          },
          {
            project_id: 'proj-pm-2', 
            project_name: 'Georgetown Road Repairs',
            required_date: '2024-02-16',
            duration: 3,
            priority: 7
          }
        ],
        resolution_options: [
          'Reschedule Georgetown Road to Feb 20th',
          'Rent additional excavator for $500/day',
          'Use smaller equipment for Georgetown Road'
        ],
        cost_to_resolve: 2500
      },
      {
        id: 'conflict-engineer',
        resource_type: 'Personnel',
        resource_name: 'Senior Civil Engineer',
        conflicting_projects: [
          {
            project_id: 'proj-pm-3',
            project_name: 'New Berbice Bridge',
            required_date: '2024-03-01',
            duration: 10,
            priority: 9
          },
          {
            project_id: 'proj-pm-4',
            project_name: 'Coastal Protection Works',
            required_date: '2024-03-05',
            duration: 7,
            priority: 8
          }
        ],
        resolution_options: [
          'Hire temporary consultant engineer',
          'Delay Coastal Protection by 1 week',
          'Use junior engineer with senior oversight'
        ],
        cost_to_resolve: 8000
      }
    ];

    // Generate optimization insights
    const mockInsights: CrossProjectInsight[] = [
      {
        id: 'insight-bulk-materials',
        insight_type: 'opportunity',
        title: 'Bulk Material Procurement Opportunity',
        description: 'Three projects need concrete in Feb-Mar. Bulk ordering could save 12% on material costs.',
        projects_involved: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'Community Center Upgrades'],
        potential_savings: 18000,
        implementation_effort: 'low',
        confidence: 89
      },
      {
        id: 'insight-shared-contractor',
        insight_type: 'optimization',
        title: 'Contractor Efficiency Optimization',
        description: 'ABC Construction working on 2 nearby projects. Coordinated scheduling could reduce mobilization costs.',
        projects_involved: ['Anna Regina Sports Complex', 'Georgetown Road Repairs'],
        potential_savings: 12000,
        potential_acceleration: 5,
        implementation_effort: 'medium',
        confidence: 76
      },
      {
        id: 'insight-risk-mitigation',
        insight_type: 'risk',
        title: 'Cascading Delay Risk',
        description: 'New Berbice Bridge delay will impact 2 downstream projects. Early intervention needed.',
        projects_involved: ['New Berbice Bridge', 'Coastal Protection Works', 'Community Center Upgrades'],
        implementation_effort: 'high',
        confidence: 92
      }
    ];

    setPatterns(mockPatterns);
    setResourceConflicts(mockConflicts);
    setInsights(mockInsights);
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  useEffect(() => {
    if (projects.length > 0) {
      generateCrossProjectAnalysis();
    }
  }, [projects]);

  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'resource_conflict': return <Users className="h-5 w-5 text-orange-600" />;
      case 'timeline_dependency': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'budget_trend': return <DollarSign className="h-5 w-5 text-green-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-600 transform rotate-180" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">🔍 Cross-Project Risk Analysis</h2>
              <p className="text-sm text-gray-600">
                AI insights across your {projects.length} project portfolio
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Controls */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={generateCrossProjectAnalysis}
                disabled={isAnalyzing}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    AI Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Re-analyze Portfolio
                  </>
                )}
              </Button>
            </div>

            {analysisComplete && (
              <div className="text-sm text-gray-600">
                Analysis complete • {patterns.length} patterns • {resourceConflicts.length} conflicts • {insights.length} insights
              </div>
            )}
          </div>

          {/* Analysis Status */}
          {isAnalyzing && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="text-blue-800 font-medium">AI analyzing cross-project patterns...</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                • Identifying resource conflicts across projects<br />
                • Analyzing timeline dependencies<br />
                • Detecting risk patterns and trends<br />
                • Finding optimization opportunities
              </div>
            </div>
          )}

          {/* Tabs */}
          {analysisComplete && (
            <>
              <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setSelectedTab('patterns')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'patterns'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Risk Patterns ({patterns.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab('conflicts')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'conflicts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Resource Conflicts ({resourceConflicts.length})
                  </button>
                  <button
                    onClick={() => setSelectedTab('insights')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === 'insights'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Optimization Insights ({insights.length})
                  </button>
                </nav>
              </div>

              {/* Risk Patterns Tab */}
              {selectedTab === 'patterns' && (
                <div className="space-y-4">
                  {patterns.map((pattern) => (
                    <Card key={pattern.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {getPatternIcon(pattern.pattern_type)}
                              <h3 className="text-lg font-semibold text-gray-900">{pattern.title}</h3>
                              <Badge className={`${getUrgencyColor(pattern.urgency)} font-medium`}>
                                {pattern.urgency.toUpperCase()}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(pattern.trend)}
                                <span className="text-sm text-gray-600 capitalize">{pattern.trend}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{pattern.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Frequency:</span>
                                <div className="font-semibold text-lg">{pattern.frequency}%</div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Impact Score:</span>
                                <div className="font-semibold text-lg">{pattern.impact_score}/10</div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Confidence:</span>
                                <div className="font-semibold text-lg">{pattern.confidence}%</div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Projects Affected:</span>
                                <div className="font-semibold text-lg">{pattern.affected_projects.length}</div>
                              </div>
                            </div>

                            {(pattern.cost_impact || pattern.timeline_impact) && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {pattern.cost_impact && (
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium">Cost Impact:</span>
                                    <span className="font-semibold text-red-600">${pattern.cost_impact.toLocaleString()}</span>
                                  </div>
                                )}
                                {pattern.timeline_impact && (
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium">Timeline Impact:</span>
                                    <span className="font-semibold text-orange-600">{pattern.timeline_impact} days</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <h4 className="font-medium text-blue-900 mb-1 flex items-center">
                                <Lightbulb className="h-4 w-4 mr-1" />
                                AI Recommendation
                              </h4>
                              <p className="text-sm text-blue-800">{pattern.recommendation}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {pattern.affected_projects.map((project, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {project}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Resource Conflicts Tab */}
              {selectedTab === 'conflicts' && (
                <div className="space-y-4">
                  {resourceConflicts.map((conflict) => (
                    <Card key={conflict.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Users className="h-5 w-5 text-orange-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {conflict.resource_name} ({conflict.resource_type})
                              </h3>
                              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                {conflict.conflicting_projects.length} Conflicts
                              </Badge>
                            </div>
                            
                            <div className="space-y-3 mb-4">
                              {conflict.conflicting_projects.map((project, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium text-gray-900">{project.project_name}</div>
                                    <div className="text-sm text-gray-600">
                                      Needed: {new Date(project.required_date).toLocaleDateString()} for {project.duration} days
                                    </div>
                                  </div>
                                  <Badge className={`${
                                    project.priority >= 8 ? 'bg-red-100 text-red-800' :
                                    project.priority >= 6 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    Priority {project.priority}
                                  </Badge>
                                </div>
                              ))}
                            </div>

                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Resolution Options:</h4>
                              <div className="space-y-2">
                                {conflict.resolution_options.map((option, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <ArrowRight className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {conflict.cost_to_resolve && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium">Cost to Resolve:</span>
                                <span className="font-semibold text-green-600">${conflict.cost_to_resolve.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Optimization Insights Tab */}
              {selectedTab === 'insights' && (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <Card key={insight.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {insight.insight_type === 'opportunity' ? (
                                <Target className="h-5 w-5 text-green-600" />
                              ) : insight.insight_type === 'optimization' ? (
                                <Zap className="h-5 w-5 text-blue-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              )}
                              <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                              <Badge className={`${
                                insight.insight_type === 'opportunity' ? 'bg-green-100 text-green-800' :
                                insight.insight_type === 'optimization' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {insight.insight_type.toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 mb-3">{insight.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                              {insight.potential_savings && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-600">Potential Savings:</span>
                                  <div className="font-semibold text-lg text-green-600">${insight.potential_savings.toLocaleString()}</div>
                                </div>
                              )}
                              {insight.potential_acceleration && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-600">Time Savings:</span>
                                  <div className="font-semibold text-lg text-blue-600">{insight.potential_acceleration} days</div>
                                </div>
                              )}
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Implementation:</span>
                                <div className={`font-semibold text-lg ${
                                  insight.implementation_effort === 'low' ? 'text-green-600' :
                                  insight.implementation_effort === 'medium' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {insight.implementation_effort.toUpperCase()}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium text-gray-600">Confidence:</span>
                                <div className="font-semibold text-lg">{insight.confidence}%</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {insight.projects_involved.map((project, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {project}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossProjectRiskAnalysis;
