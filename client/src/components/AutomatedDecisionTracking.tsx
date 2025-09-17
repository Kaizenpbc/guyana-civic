import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Target,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  FileText,
  Lightbulb
} from 'lucide-react';

interface DecisionOutcome {
  id: string;
  decisionId: string;
  decisionTitle: string;
  projectId: string;
  projectName: string;
  outcome: 'successful' | 'partially_successful' | 'unsuccessful' | 'pending';
  impactScore: number; // 1-10 scale
  timelineImpact: 'ahead' | 'on_time' | 'delayed' | 'significantly_delayed';
  budgetImpact: 'under_budget' | 'on_budget' | 'over_budget' | 'significantly_over';
  qualityImpact: 'exceeded' | 'met' | 'below' | 'significantly_below';
  stakeholderSatisfaction: number; // 1-10 scale
  lessonsLearned: string;
  recommendations: string[];
  measuredAt: string;
  measuredBy: string;
  nextReviewDate?: string;
}

interface DecisionInsight {
  id: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'success';
  title: string;
  description: string;
  confidence: number; // 0-100%
  impact: 'low' | 'medium' | 'high';
  category: 'timeline' | 'budget' | 'quality' | 'stakeholder' | 'process';
  actionable: boolean;
  relatedDecisions: string[];
}

interface AutomatedDecisionTrackingProps {
  projectId?: string;
  onInsightGenerated?: (insight: DecisionInsight) => void;
}

const AutomatedDecisionTracking: React.FC<AutomatedDecisionTrackingProps> = ({
  projectId,
  onInsightGenerated
}) => {
  const [decisionOutcomes, setDecisionOutcomes] = useState<DecisionOutcome[]>([]);
  const [decisionInsights, setDecisionInsights] = useState<DecisionInsight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<DecisionOutcome | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<DecisionInsight | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  // Mock data for demonstration
  const mockOutcomes: DecisionOutcome[] = [
    {
      id: 'outcome-1',
      decisionId: 'decision-1',
      decisionTitle: 'Use Prefabricated Materials for Sports Complex',
      projectId: 'proj-pm-4',
      projectName: 'Anna Regina Sports Complex',
      outcome: 'successful',
      impactScore: 8,
      timelineImpact: 'ahead',
      budgetImpact: 'under_budget',
      qualityImpact: 'met',
      stakeholderSatisfaction: 9,
      lessonsLearned: 'Prefabricated materials reduced construction time by 30% and costs by 15%',
      recommendations: [
        'Consider prefabricated materials for future construction projects',
        'Establish relationships with reliable prefab suppliers',
        'Update procurement guidelines to include prefab options'
      ],
      measuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      measuredBy: 'Project Manager',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 1 month from now
    },
    {
      id: 'outcome-2',
      decisionId: 'decision-2',
      decisionTitle: 'Extend School Renovation Timeline',
      projectId: 'proj-pm-1',
      projectName: 'Essequibo Coast School Renovation',
      outcome: 'partially_successful',
      impactScore: 6,
      timelineImpact: 'delayed',
      budgetImpact: 'on_budget',
      qualityImpact: 'exceeded',
      stakeholderSatisfaction: 7,
      lessonsLearned: 'Extended timeline allowed for better quality work but increased stakeholder concerns',
      recommendations: [
        'Improve communication with stakeholders during timeline changes',
        'Consider phased delivery to maintain stakeholder confidence',
        'Develop better timeline estimation methods'
      ],
      measuredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      measuredBy: 'Project Manager'
    },
    {
      id: 'outcome-3',
      decisionId: 'decision-3',
      decisionTitle: 'Change Health Center Design Mid-Project',
      projectId: 'proj-pm-2',
      projectName: 'Pomeroon Health Center Upgrade',
      outcome: 'unsuccessful',
      impactScore: 3,
      timelineImpact: 'significantly_delayed',
      budgetImpact: 'significantly_over',
      qualityImpact: 'below',
      stakeholderSatisfaction: 4,
      lessonsLearned: 'Mid-project design changes are extremely costly and should be avoided',
      recommendations: [
        'Lock in design before construction begins',
        'Implement change control process',
        'Require stakeholder approval for any design changes'
      ],
      measuredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
      measuredBy: 'Regional Manager'
    }
  ];

  const mockInsights: DecisionInsight[] = [
    {
      id: 'insight-1',
      type: 'pattern',
      title: 'Prefabricated Materials Success Pattern',
      description: 'Decisions involving prefabricated materials consistently show positive outcomes with 85% success rate',
      confidence: 87,
      impact: 'high',
      category: 'process',
      actionable: true,
      relatedDecisions: ['decision-1']
    },
    {
      id: 'insight-2',
      type: 'warning',
      title: 'Mid-Project Changes Risk',
      description: 'Design changes after project start increase budget overruns by average 40% and delays by 60%',
      confidence: 92,
      impact: 'high',
      category: 'budget',
      actionable: true,
      relatedDecisions: ['decision-3']
    },
    {
      id: 'insight-3',
      type: 'recommendation',
      title: 'Stakeholder Communication Improvement',
      description: 'Projects with regular stakeholder updates show 25% higher satisfaction scores',
      confidence: 78,
      impact: 'medium',
      category: 'stakeholder',
      actionable: true,
      relatedDecisions: ['decision-2']
    }
  ];

  useEffect(() => {
    setDecisionOutcomes(mockOutcomes);
    setDecisionInsights(mockInsights);
  }, [projectId]);

  const analyzeDecisionPatterns = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate new insights based on patterns
    const newInsights: DecisionInsight[] = [
      {
        id: `insight-${Date.now()}`,
        type: 'success',
        title: 'Timeline Extension Success Factor',
        description: 'Projects that extend timelines for quality improvements show 80% stakeholder satisfaction when properly communicated',
        confidence: 82,
        impact: 'medium',
        category: 'timeline',
        actionable: true,
        relatedDecisions: ['decision-2']
      }
    ];

    setDecisionInsights(prev => [...newInsights, ...prev]);
    
    // Notify parent component
    newInsights.forEach(insight => {
      onInsightGenerated?.(insight);
    });

    setIsAnalyzing(false);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'successful': return 'bg-green-100 text-green-800';
      case 'partially_successful': return 'bg-yellow-100 text-yellow-800';
      case 'unsuccessful': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'ahead': return 'bg-green-100 text-green-800';
      case 'on_time': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-yellow-100 text-yellow-800';
      case 'significantly_delayed': return 'bg-red-100 text-red-800';
      case 'under_budget': return 'bg-green-100 text-green-800';
      case 'on_budget': return 'bg-blue-100 text-blue-800';
      case 'over_budget': return 'bg-yellow-100 text-yellow-800';
      case 'significantly_over': return 'bg-red-100 text-red-800';
      case 'exceeded': return 'bg-green-100 text-green-800';
      case 'met': return 'bg-blue-100 text-blue-800';
      case 'below': return 'bg-yellow-100 text-yellow-800';
      case 'significantly_below': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'bg-blue-100 text-blue-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-red-100 text-red-800';
      case 'success': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOverallSuccessRate = () => {
    const successful = decisionOutcomes.filter(o => o.outcome === 'successful').length;
    const partiallySuccessful = decisionOutcomes.filter(o => o.outcome === 'partially_successful').length;
    return decisionOutcomes.length > 0 ? Math.round(((successful + partiallySuccessful * 0.5) / decisionOutcomes.length) * 100) : 0;
  };

  const calculateAverageImpactScore = () => {
    return decisionOutcomes.length > 0 
      ? Math.round(decisionOutcomes.reduce((sum, o) => sum + o.impactScore, 0) / decisionOutcomes.length * 10) / 10
      : 0;
  };

  const generateActionsFromInsight = (insight: DecisionInsight): string[] => {
    const actions: string[] = [];
    
    switch (insight.type) {
      case 'pattern':
        if (insight.title.includes('Prefabricated Materials')) {
          actions.push(
            'Update procurement guidelines to prioritize prefabricated materials',
            'Establish partnerships with reliable prefab suppliers',
            'Create cost-benefit analysis template for prefab vs traditional materials',
            'Train project teams on prefab material benefits and selection'
          );
        } else if (insight.title.includes('Timeline Extension')) {
          actions.push(
            'Develop stakeholder communication protocol for timeline changes',
            'Create timeline extension approval process with clear criteria',
            'Implement regular progress updates to maintain stakeholder confidence',
            'Establish quality vs timeline trade-off decision framework'
          );
        }
        break;
        
      case 'warning':
        if (insight.title.includes('Mid-Project Changes')) {
          actions.push(
            'Implement strict change control process with approval requirements',
            'Create change impact assessment template (cost, time, quality)',
            'Establish stakeholder approval thresholds for design changes',
            'Develop change request documentation and tracking system'
          );
        }
        break;
        
      case 'recommendation':
        if (insight.title.includes('Stakeholder Communication')) {
          actions.push(
            'Schedule weekly stakeholder update meetings',
            'Create standardized progress report template',
            'Implement stakeholder feedback collection system',
            'Develop communication escalation matrix for different issue types'
          );
        }
        break;
        
      case 'success':
        actions.push(
          'Document successful practices in project knowledge base',
          'Share success story with other project teams',
          'Create best practice checklist for future projects',
          'Schedule lessons learned session with project team'
        );
        break;
        
      default:
        actions.push(
          'Review insight details with project team',
          'Consider implementing recommended practices',
          'Monitor impact of any changes made',
          'Update project documentation with new learnings'
        );
    }
    
    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Automated Decision Tracking</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
          >
            {showInsights ? 'Hide Insights' : 'View Insights'}
          </Button>
          <Button
            onClick={analyzeDecisionPatterns}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Analyze Patterns
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{calculateOverallSuccessRate()}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Impact Score</p>
                <p className="text-2xl font-bold text-blue-600">{calculateAverageImpactScore()}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Decisions Tracked</p>
                <p className="text-2xl font-bold text-purple-600">{decisionOutcomes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Generated</p>
                <p className="text-2xl font-bold text-orange-600">{decisionInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Insights */}
      {showInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-orange-600" />
              <span>AI-Generated Insights ({decisionInsights.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {decisionInsights.map((insight) => (
                <div key={insight.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <Badge className={getInsightTypeColor(insight.type)}>
                          {insight.type.toUpperCase()}
                        </Badge>
                        <Badge className={getInsightImpactColor(insight.impact)}>
                          {insight.impact.toUpperCase()} IMPACT
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% Confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span><strong>Category:</strong> {insight.category}</span>
                        <span><strong>Actionable:</strong> {insight.actionable ? 'Yes' : 'No'}</span>
                        <span><strong>Related Decisions:</strong> {insight.relatedDecisions.length}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {insight.actionable && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedInsight(insight);
                            setShowActionsModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Actions
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision Outcomes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Decision Outcomes ({decisionOutcomes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {decisionOutcomes.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No decision outcomes tracked yet. Start making decisions and track their results to build insights.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {decisionOutcomes.map((outcome) => (
                <div key={outcome.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{outcome.decisionTitle}</h4>
                        <Badge className={getOutcomeColor(outcome.outcome)}>
                          {outcome.outcome.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          Impact: {outcome.impactScore}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Project:</strong> {outcome.projectName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Lessons Learned:</strong> {outcome.lessonsLearned}
                      </p>
                      
                      {/* Impact Metrics */}
                      <div className="grid grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Timeline</p>
                          <Badge className={getImpactColor(outcome.timelineImpact)}>
                            {outcome.timelineImpact.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Budget</p>
                          <Badge className={getImpactColor(outcome.budgetImpact)}>
                            {outcome.budgetImpact.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Quality</p>
                          <Badge className={getImpactColor(outcome.qualityImpact)}>
                            {outcome.qualityImpact.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      {/* Stakeholder Satisfaction */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600">Stakeholder Satisfaction</span>
                          <span className="text-sm text-gray-500">{outcome.stakeholderSatisfaction}/10</span>
                        </div>
                        <Progress value={outcome.stakeholderSatisfaction * 10} className="h-2" />
                      </div>

                      {/* Recommendations */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <div className="space-y-1">
                          {outcome.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-3">
                        <strong>Measured:</strong> {new Date(outcome.measuredAt).toLocaleDateString()} by {outcome.measuredBy}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOutcome(outcome)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outcome Details Modal */}
      {selectedOutcome && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Decision Outcome Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOutcome(null)}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedOutcome.decisionTitle}</h4>
                  <p className="text-sm text-gray-600">Project: {selectedOutcome.projectName}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Impact Metrics</h5>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Overall Impact Score</span>
                          <span className="text-sm font-medium">{selectedOutcome.impactScore}/10</span>
                        </div>
                        <Progress value={selectedOutcome.impactScore * 10} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">Stakeholder Satisfaction</span>
                          <span className="text-sm font-medium">{selectedOutcome.stakeholderSatisfaction}/10</span>
                        </div>
                        <Progress value={selectedOutcome.stakeholderSatisfaction * 10} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Impact Categories</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Timeline:</span>
                        <Badge className={getImpactColor(selectedOutcome.timelineImpact)}>
                          {selectedOutcome.timelineImpact.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget:</span>
                        <Badge className={getImpactColor(selectedOutcome.budgetImpact)}>
                          {selectedOutcome.budgetImpact.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quality:</span>
                        <Badge className={getImpactColor(selectedOutcome.qualityImpact)}>
                          {selectedOutcome.qualityImpact.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Lessons Learned</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedOutcome.lessonsLearned}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Recommendations</h5>
                  <div className="space-y-2">
                    {selectedOutcome.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Modal */}
      {showActionsModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recommended Actions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowActionsModal(false);
                    setSelectedInsight(null);
                  }}
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedInsight.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{selectedInsight.description}</p>
                  <div className="flex space-x-2">
                    <Badge className={getInsightTypeColor(selectedInsight.type)}>
                      {selectedInsight.type.toUpperCase()}
                    </Badge>
                    <Badge className={getInsightImpactColor(selectedInsight.impact)}>
                      {selectedInsight.impact.toUpperCase()} IMPACT
                    </Badge>
                    <Badge variant="outline">
                      {selectedInsight.confidence}% Confidence
                    </Badge>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-3">Recommended Actions:</h5>
                  <div className="space-y-3">
                    {generateActionsFromInsight(selectedInsight).map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{action}</p>
                        </div>
                        <Button size="sm" variant="outline" className="flex-shrink-0">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Done
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowActionsModal(false);
                      setSelectedInsight(null);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      // Here you could implement saving actions to a task list
                      alert('Actions saved to your task list!');
                      setShowActionsModal(false);
                      setSelectedInsight(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save to Task List
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedDecisionTracking;
