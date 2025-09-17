import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Eye,
  FileText,
  ArrowRight,
  Star,
  Shield,
  Activity,
  XCircle
} from 'lucide-react';

interface DecisionContext {
  projectId: string;
  projectName: string;
  currentStatus: string;
  timeline: {
    plannedStart: string;
    plannedEnd: string;
    currentProgress: number;
    daysRemaining: number;
  };
  budget: {
    total: number;
    spent: number;
    remaining: number;
    overrunRisk: boolean;
  };
  risks: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: number;
  }>;
  issues: Array<{
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: string;
  }>;
  stakeholders: Array<{
    name: string;
    role: string;
    satisfaction: number;
    influence: 'low' | 'medium' | 'high';
  }>;
  resources: {
    teamSize: number;
    skillLevel: 'junior' | 'intermediate' | 'senior';
    availability: number;
  };
}

interface DecisionOption {
  id: string;
  title: string;
  description: string;
  type: 'timeline' | 'budget' | 'scope' | 'resources' | 'quality';
  impact: {
    timeline: number; // -2 to +2 (negative = delay, positive = ahead)
    budget: number; // -2 to +2 (negative = cost increase, positive = savings)
    quality: number; // -2 to +2 (negative = quality decrease, positive = improvement)
    stakeholderSatisfaction: number; // -2 to +2
  };
  risks: Array<{
    title: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
  requirements: string[];
  successProbability: number; // 0-100%
  confidence: number; // 0-100%
  reasoning: string;
}

interface SmartRecommendation {
  id: string;
  primaryOption: DecisionOption;
  alternativeOptions: DecisionOption[];
  overallConfidence: number;
  keyFactors: string[];
  riskAssessment: {
    overall: 'low' | 'medium' | 'high';
    criticalRisks: string[];
    mitigationStrategies: string[];
  };
  expectedOutcome: {
    timeline: string;
    budget: string;
    quality: string;
    stakeholderSatisfaction: string;
  };
  nextSteps: string[];
  monitoringPoints: string[];
}

interface SmartDecisionEngineProps {
  projectId?: string;
  onRecommendationGenerated?: (recommendation: SmartRecommendation) => void;
}

const SmartDecisionEngine: React.FC<SmartDecisionEngineProps> = ({
  projectId,
  onRecommendationGenerated
}) => {
  const [decisionContext, setDecisionContext] = useState<DecisionContext | null>(null);
  const [decisionQuestion, setDecisionQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<SmartRecommendation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pendingDecisions, setPendingDecisions] = useState<any[]>([]);
  const [showPendingDecisions, setShowPendingDecisions] = useState(false);
  const [selectedPendingDecision, setSelectedPendingDecision] = useState<any>(null);

  // Mock project context data
  const mockContext: DecisionContext = {
    projectId: 'proj-pm-4',
    projectName: 'Anna Regina Sports Complex',
    currentStatus: 'in_progress',
    timeline: {
      plannedStart: '2024-01-15',
      plannedEnd: '2024-06-30',
      currentProgress: 45,
      daysRemaining: 120
    },
    budget: {
      total: 2500000,
      spent: 1125000,
      remaining: 1375000,
      overrunRisk: false
    },
    risks: [
      {
        id: 'risk-1',
        title: 'Material Delivery Delays',
        severity: 'high',
        probability: 70,
        impact: 8
      },
      {
        id: 'risk-2',
        title: 'Weather Impact on Construction',
        severity: 'medium',
        probability: 40,
        impact: 6
      }
    ],
    issues: [
      {
        id: 'issue-1',
        title: 'Foundation Work Behind Schedule',
        severity: 'high',
        status: 'open'
      }
    ],
    stakeholders: [
      {
        name: 'Regional Manager',
        role: 'Sponsor',
        satisfaction: 7,
        influence: 'high'
      },
      {
        name: 'Community Council',
        role: 'End User',
        satisfaction: 6,
        influence: 'high'
      }
    ],
    resources: {
      teamSize: 12,
      skillLevel: 'intermediate',
      availability: 85
    }
  };

  // Mock decision history for context
  const mockDecisionHistory = [
    {
      id: 'decision-1',
      title: 'Use Prefabricated Materials for Sports Complex',
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
      measuredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      measuredBy: 'Project Manager'
    },
    {
      id: 'decision-2',
      title: 'Extend School Renovation Timeline',
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
      measuredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      measuredBy: 'Project Manager'
    },
    {
      id: 'decision-3',
      title: 'Change Health Center Design Mid-Project',
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
      measuredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      measuredBy: 'Regional Manager'
    }
  ];

  // Mock pending decisions
  const mockPendingDecisions = [
    {
      id: 'pending-1',
      question: 'Should we use prefabricated materials for the sports complex construction?',
      recommendation: 'Use Prefabricated Materials',
      confidence: 87,
      status: 'pending_confirmation',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      projectName: 'Anna Regina Sports Complex',
      impact: {
        timeline: 1, // ahead of schedule
        budget: 1, // under budget
        quality: 0, // maintained
        stakeholders: 1 // improved satisfaction
      }
    },
    {
      id: 'pending-2',
      question: 'Should we extend the school renovation timeline due to foundation issues?',
      recommendation: 'Extend Timeline by 2 Weeks',
      confidence: 75,
      status: 'pending_confirmation',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      projectName: 'Essequibo Coast School Renovation',
      impact: {
        timeline: -1, // delayed
        budget: 0, // no change
        quality: 1, // improved
        stakeholders: -1 // decreased satisfaction
      }
    },
    {
      id: 'pending-3',
      question: 'Should we change the health center design mid-project?',
      recommendation: 'Do NOT Change Design',
      confidence: 92,
      status: 'pending_confirmation',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      projectName: 'Pomeroon Health Center Upgrade',
      impact: {
        timeline: 0, // no change
        budget: 1, // cost savings
        quality: 1, // maintained quality
        stakeholders: 1 // improved satisfaction
      }
    }
  ];

  useEffect(() => {
    setDecisionContext(mockContext);
    setPendingDecisions(mockPendingDecisions);
  }, [projectId]);

  const generateRecommendation = async () => {
    if (!decisionQuestion.trim() || !decisionContext) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate smart recommendation based on context and question
    const mockRecommendation: SmartRecommendation = {
      id: `rec-${Date.now()}`,
      primaryOption: {
        id: 'opt-1',
        title: 'Extend Timeline by 3 Weeks',
        description: 'Extend project completion by 3 weeks to address foundation delays and ensure quality',
        type: 'timeline',
        impact: {
          timeline: -1, // 3 week delay
          budget: 0, // minimal cost impact
          quality: 1, // improved quality
          stakeholderSatisfaction: 0 // maintained satisfaction
        },
        risks: [
          {
            title: 'Stakeholder Dissatisfaction',
            probability: 30,
            impact: 6,
            mitigation: 'Regular communication and progress updates'
          }
        ],
        requirements: [
          'Stakeholder approval for timeline extension',
          'Updated project schedule',
          'Communication plan for stakeholders'
        ],
        successProbability: 85,
        confidence: 78,
        reasoning: 'Given the foundation delays and high stakeholder influence, extending timeline provides best balance of quality and stakeholder satisfaction while minimizing budget impact.'
      },
      alternativeOptions: [
        {
          id: 'opt-2',
          title: 'Add Additional Resources',
          description: 'Hire additional construction workers to accelerate foundation work',
          type: 'resources',
          impact: {
            timeline: 1, // faster completion
            budget: -1, // increased costs
            quality: 0, // maintained quality
            stakeholderSatisfaction: 1 // improved satisfaction
          },
          risks: [
            {
              title: 'Budget Overrun',
              probability: 60,
              impact: 7,
              mitigation: 'Careful resource planning and cost monitoring'
            }
          ],
          requirements: [
            'Budget approval for additional resources',
            'Recruitment of skilled workers',
            'Resource coordination plan'
          ],
          successProbability: 70,
          confidence: 65,
          reasoning: 'Adding resources could accelerate timeline but carries higher budget risk and may not address quality concerns from rushed work.'
        }
      ],
      overallConfidence: 78,
      keyFactors: [
        'Foundation work is 2 weeks behind schedule',
        'High stakeholder influence requires careful communication',
        'Budget has 15% buffer remaining',
        'Quality standards are non-negotiable'
      ],
      riskAssessment: {
        overall: 'medium',
        criticalRisks: [
          'Stakeholder dissatisfaction with timeline extension',
          'Potential for additional delays if foundation issues persist'
        ],
        mitigationStrategies: [
          'Implement weekly stakeholder communication plan',
          'Conduct daily foundation progress reviews',
          'Prepare contingency plan for additional delays'
        ]
      },
      expectedOutcome: {
        timeline: 'Project completed 3 weeks later than planned',
        budget: 'Within 5% of original budget',
        quality: 'Meets all quality standards',
        stakeholderSatisfaction: 'Maintained at current levels'
      },
      nextSteps: [
        'Present recommendation to Regional Manager',
        'Schedule stakeholder communication meeting',
        'Update project schedule and milestones',
        'Implement daily progress monitoring'
      ],
      monitoringPoints: [
        'Foundation completion progress',
        'Stakeholder feedback and satisfaction',
        'Budget burn rate',
        'Quality inspection results'
      ]
    };

    setRecommendation(mockRecommendation);
    onRecommendationGenerated?.(mockRecommendation);
    setIsAnalyzing(false);
  };

  const addToPendingDecisions = (recommendation: SmartRecommendation) => {
    const pendingDecision = {
      id: `pending-${Date.now()}`,
      question: decisionQuestion,
      recommendation: recommendation.primaryOption.title,
      confidence: recommendation.overallConfidence,
      status: 'pending_confirmation',
      createdAt: new Date().toISOString(),
      projectName: decisionContext?.projectName || 'Unknown Project',
      impact: recommendation.primaryOption.impact,
      fullRecommendation: recommendation
    };
    
    setPendingDecisions(prev => [pendingDecision, ...prev]);
    setDecisionQuestion(''); // Clear the question
    setRecommendation(null); // Clear the current recommendation
  };

  const confirmDecision = (decisionId: string) => {
    setPendingDecisions(prev => 
      prev.map(decision => 
        decision.id === decisionId 
          ? { ...decision, status: 'confirmed' }
          : decision
      )
    );
  };

  const rejectDecision = (decisionId: string) => {
    setPendingDecisions(prev => 
      prev.map(decision => 
        decision.id === decisionId 
          ? { ...decision, status: 'rejected' }
          : decision
      )
    );
  };

  const getAIRecommendationForDecision = async (decision: any) => {
    console.log('Getting AI recommendation for decision:', decision);
    setSelectedPendingDecision(decision);
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate specific recommendation based on the pending decision
    let mockRecommendation: SmartRecommendation;
    
    if (decision.question.includes('prefabricated materials')) {
      mockRecommendation = {
        id: `rec-${Date.now()}`,
        primaryOption: {
          id: 'opt-1',
          title: 'Use Prefabricated Materials',
          description: 'Implement prefabricated materials for faster construction and cost savings',
          type: 'scope',
          impact: {
            timeline: 1, // ahead of schedule
            budget: 1, // under budget
            quality: 0, // maintained
            stakeholderSatisfaction: 1 // improved satisfaction
          },
          risks: [
            {
              title: 'Supplier Availability',
              probability: 30,
              impact: 6,
              mitigation: 'Secure supplier contracts early and have backup suppliers'
            }
          ],
          requirements: [
            'Identify reliable prefab suppliers',
            'Update procurement specifications',
            'Train construction team on prefab assembly'
          ],
          successProbability: 87,
          confidence: 85,
          reasoning: 'Prefabricated materials consistently show 30% faster construction and 15% cost savings based on historical data.'
        },
        alternativeOptions: [],
        overallConfidence: 85,
        keyFactors: [
          'Historical success rate of 85% with prefab materials',
          'Current project timeline allows for procurement lead time',
          'Budget has sufficient buffer for potential premium costs',
          'Construction team has experience with prefab assembly'
        ],
        riskAssessment: {
          overall: 'low',
          criticalRisks: [
            'Potential supplier delays if not secured early'
          ],
          mitigationStrategies: [
            'Secure supplier contracts immediately',
            'Identify backup suppliers',
            'Create detailed assembly timeline'
          ]
        },
        expectedOutcome: {
          timeline: 'Project completed 3 weeks ahead of schedule',
          budget: '15% under budget due to reduced labor costs',
          quality: 'Meets all quality standards with faster delivery',
          stakeholderSatisfaction: 'Improved due to faster completion'
        },
        nextSteps: [
          'Contact prefab suppliers for quotes',
          'Update project specifications',
          'Schedule supplier meetings',
          'Create assembly timeline'
        ],
        monitoringPoints: [
          'Supplier delivery schedules',
          'Assembly progress',
          'Quality inspection results',
          'Cost tracking vs traditional materials'
        ]
      };
    } else if (decision.question.includes('timeline')) {
      mockRecommendation = {
        id: `rec-${Date.now()}`,
        primaryOption: {
          id: 'opt-1',
          title: 'Extend Timeline by 2 Weeks',
          description: 'Extend project timeline to address foundation issues and ensure quality',
          type: 'timeline',
          impact: {
            timeline: -1, // 2 week delay
            budget: 0, // minimal cost impact
            quality: 1, // improved quality
            stakeholderSatisfaction: -1 // decreased satisfaction
          },
          risks: [
            {
              title: 'Stakeholder Dissatisfaction',
              probability: 40,
              impact: 7,
              mitigation: 'Regular communication and progress updates'
            }
          ],
          requirements: [
            'Stakeholder approval for timeline extension',
            'Updated project schedule',
            'Communication plan for stakeholders'
          ],
          successProbability: 75,
          confidence: 78,
          reasoning: 'Foundation issues require additional time for proper resolution. Timeline extension provides best balance of quality and stakeholder satisfaction.'
        },
        alternativeOptions: [],
        overallConfidence: 78,
        keyFactors: [
          'Foundation work is 2 weeks behind schedule',
          'High stakeholder influence requires careful communication',
          'Budget has 15% buffer remaining',
          'Quality standards are non-negotiable'
        ],
        riskAssessment: {
          overall: 'medium',
          criticalRisks: [
            'Stakeholder dissatisfaction with timeline extension',
            'Potential for additional delays if foundation issues persist'
          ],
          mitigationStrategies: [
            'Implement weekly stakeholder communication plan',
            'Conduct daily foundation progress reviews',
            'Prepare contingency plan for additional delays'
          ]
        },
        expectedOutcome: {
          timeline: 'Project completed 2 weeks later than planned',
          budget: 'Within 5% of original budget',
          quality: 'Meets all quality standards',
          stakeholderSatisfaction: 'Maintained at current levels with proper communication'
        },
        nextSteps: [
          'Present recommendation to Regional Manager',
          'Schedule stakeholder communication meeting',
          'Update project schedule and milestones',
          'Implement daily progress monitoring'
        ],
        monitoringPoints: [
          'Foundation completion progress',
          'Stakeholder feedback and satisfaction',
          'Budget burn rate',
          'Quality inspection results'
        ]
      };
    } else {
      // Default recommendation for design changes
      mockRecommendation = {
        id: `rec-${Date.now()}`,
        primaryOption: {
          id: 'opt-1',
          title: 'Do NOT Change Design',
          description: 'Maintain current design to avoid cost overruns and delays',
          type: 'scope',
          impact: {
            timeline: 0, // no change
            budget: 1, // cost savings
            quality: 1, // maintained quality
            stakeholderSatisfaction: 1 // improved satisfaction
          },
          risks: [
            {
              title: 'Stakeholder Disappointment',
              probability: 20,
              impact: 5,
              mitigation: 'Explain benefits of current design and provide alternatives'
            }
          ],
          requirements: [
            'Stakeholder communication about design benefits',
            'Documentation of current design advantages',
            'Alternative solution proposals if needed'
          ],
          successProbability: 92,
          confidence: 90,
          reasoning: 'Mid-project design changes consistently result in 40% budget overruns and 60% delays. Current design meets all requirements.'
        },
        alternativeOptions: [],
        overallConfidence: 90,
        keyFactors: [
          'Current design meets all functional requirements',
          'Mid-project changes carry high risk of cost overruns',
          'Timeline is already tight with current scope',
          'Stakeholders have approved current design'
        ],
        riskAssessment: {
          overall: 'low',
          criticalRisks: [
            'Potential stakeholder disappointment with design limitations'
          ],
          mitigationStrategies: [
            'Clear communication about design benefits',
            'Provide alternative solutions within current design',
            'Document cost and timeline impacts of changes'
          ]
        },
        expectedOutcome: {
          timeline: 'Project completed on schedule',
          budget: 'Within 5% of original budget',
          quality: 'Meets all quality standards',
          stakeholderSatisfaction: 'Maintained with proper communication'
        },
        nextSteps: [
          'Schedule stakeholder meeting to discuss design benefits',
          'Prepare documentation of current design advantages',
          'Develop alternative solutions within current design',
          'Implement regular progress updates'
        ],
        monitoringPoints: [
          'Stakeholder satisfaction levels',
          'Budget tracking',
          'Timeline adherence',
          'Quality inspection results'
        ]
      };
    }
    
    console.log('Generated recommendation:', mockRecommendation);
    setRecommendation(mockRecommendation);
    setIsAnalyzing(false);
    console.log('Analysis complete, recommendation set');
  };

  const getImpactColor = (impact: number) => {
    if (impact > 0) return 'text-green-600';
    if (impact < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp className="h-4 w-4" />;
    if (impact < 0) return <TrendingDown className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!decisionContext) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading project context...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Decision Engine</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPendingDecisions(!showPendingDecisions)}
            className="relative"
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending Decisions
            {pendingDecisions.filter(d => d.status === 'pending_confirmation').length > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                {pendingDecisions.filter(d => d.status === 'pending_confirmation').length}
              </Badge>
            )}
          </Button>
          <Badge className="bg-purple-100 text-purple-800">
            AI-Powered
          </Badge>
        </div>
      </div>

      {/* Project Context Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Project Context - {decisionContext.projectName}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Timeline</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{decisionContext.timeline.currentProgress}%</p>
              <p className="text-xs text-gray-500">{decisionContext.timeline.daysRemaining} days left</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Budget</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ${(decisionContext.budget.spent / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500">
                ${(decisionContext.budget.remaining / 1000000).toFixed(1)}M remaining
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Risks</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{decisionContext.risks.length}</p>
              <p className="text-xs text-gray-500">
                {decisionContext.risks.filter(r => r.severity === 'high' || r.severity === 'critical').length} critical
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Stakeholders</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{decisionContext.stakeholders.length}</p>
              <p className="text-xs text-gray-500">
                Avg satisfaction: {Math.round(decisionContext.stakeholders.reduce((sum, s) => sum + s.satisfaction, 0) / decisionContext.stakeholders.length)}/10
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Decisions */}
      {showPendingDecisions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>Pending Decisions ({pendingDecisions.filter(d => d.status === 'pending_confirmation').length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingDecisions.filter(d => d.status === 'pending_confirmation').length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No decisions pending confirmation. All AI recommendations have been reviewed.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {pendingDecisions
                  .filter(d => d.status === 'pending_confirmation')
                  .map((decision) => (
                    <div key={decision.id} className="border rounded-lg p-4 bg-orange-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{decision.recommendation}</h4>
                            <Badge className="bg-orange-100 text-orange-800">
                              {decision.confidence}% Confidence
                            </Badge>
                            <Badge variant="outline">
                              {decision.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Question:</strong> {decision.question}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Project:</strong> {decision.projectName}
                          </p>
                          <p className="text-sm text-gray-500">
                            <strong>Created:</strong> {new Date(decision.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => getAIRecommendationForDecision(decision)}
                            disabled={isAnalyzing}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            {isAnalyzing && selectedPendingDecision?.id === decision.id ? (
                              <>
                                <Brain className="h-4 w-4 mr-1 animate-pulse" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 mr-1" />
                                Get AI Recommendation
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => confirmDecision(decision.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectDecision(decision.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      
                      {/* Impact Preview */}
                      <div className="grid grid-cols-4 gap-4 mt-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Timeline</span>
                          </div>
                          <div className={`flex items-center justify-center ${getImpactColor(decision.impact.timeline)}`}>
                            {getImpactIcon(decision.impact.timeline)}
                            <span className="ml-1 text-sm font-medium">
                              {decision.impact.timeline > 0 ? '+' : ''}{decision.impact.timeline}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Budget</span>
                          </div>
                          <div className={`flex items-center justify-center ${getImpactColor(decision.impact.budget)}`}>
                            {getImpactIcon(decision.impact.budget)}
                            <span className="ml-1 text-sm font-medium">
                              {decision.impact.budget > 0 ? '+' : ''}{decision.impact.budget}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Shield className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Quality</span>
                          </div>
                          <div className={`flex items-center justify-center ${getImpactColor(decision.impact.quality)}`}>
                            {getImpactIcon(decision.impact.quality)}
                            <span className="ml-1 text-sm font-medium">
                              {decision.impact.quality > 0 ? '+' : ''}{decision.impact.quality}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Stakeholders</span>
                          </div>
                          <div className={`flex items-center justify-center ${getImpactColor(decision.impact.stakeholders)}`}>
                            {getImpactIcon(decision.impact.stakeholders)}
                            <span className="ml-1 text-sm font-medium">
                              {decision.impact.stakeholders > 0 ? '+' : ''}{decision.impact.stakeholders}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Decision Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>What Decision Do You Need Help With?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="decision-question">Decision Question</Label>
              <Textarea
                id="decision-question"
                placeholder="e.g., Should I extend the timeline to address foundation delays, or add more resources to catch up?"
                value={decisionQuestion}
                onChange={(e) => setDecisionQuestion(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={generateRecommendation}
                disabled={!decisionQuestion.trim() || isAnalyzing}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing Context & Generating Recommendation...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Get AI Recommendation
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  console.log('Test button clicked');
                  const testRec = {
                    id: 'test-rec',
                    primaryOption: {
                      id: 'test-opt',
                      title: 'Test Recommendation',
                      description: 'This is a test recommendation',
                      type: 'timeline' as const,
                      impact: { timeline: 1, budget: 0, quality: 1, stakeholderSatisfaction: 1 },
                      risks: [],
                      requirements: [],
                      successProbability: 85,
                      confidence: 80,
                      reasoning: 'Test reasoning'
                    },
                    alternativeOptions: [],
                    overallConfidence: 80,
                    keyFactors: ['Test factor'],
                    riskAssessment: { overall: 'low' as const, criticalRisks: [], mitigationStrategies: [] },
                    expectedOutcome: { timeline: 'On time', budget: 'On budget', quality: 'Good', stakeholderSatisfaction: 'High' },
                    nextSteps: ['Test step'],
                    monitoringPoints: ['Test monitoring']
                  };
                  setRecommendation(testRec);
                  console.log('Test recommendation set:', testRec);
                }}
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analyzing Indicator */}
      {isAnalyzing && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analyzing Decision...</h3>
              <p className="text-gray-600">
                Analyzing project context, risks, and stakeholder requirements for: 
                <br />
                <strong>{selectedPendingDecision?.question}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-700 mb-2">Debug Info:</h4>
            <p className="text-sm text-gray-600">isAnalyzing: {isAnalyzing ? 'true' : 'false'}</p>
            <p className="text-sm text-gray-600">hasRecommendation: {recommendation ? 'true' : 'false'}</p>
            <p className="text-sm text-gray-600">selectedPendingDecision: {selectedPendingDecision ? selectedPendingDecision.id : 'none'}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendation */}
      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>AI Recommendation</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                {recommendation.overallConfidence}% Confidence
              </Badge>
              {selectedPendingDecision && (
                <Badge className="bg-purple-100 text-purple-800">
                  For: {selectedPendingDecision.projectName}
                </Badge>
              )}
            </CardTitle>
            {selectedPendingDecision && (
              <p className="text-sm text-gray-600 mt-2">
                <strong>Question:</strong> {selectedPendingDecision.question}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Primary Recommendation */}
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-green-800 text-lg">
                      {recommendation.primaryOption.title}
                    </h4>
                    <p className="text-green-700 mt-1">{recommendation.primaryOption.description}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 mb-2">
                      {recommendation.primaryOption.successProbability}% Success Rate
                    </Badge>
                    <Badge variant="outline">
                      {recommendation.primaryOption.confidence}% Confidence
                    </Badge>
                  </div>
                </div>

                {/* Impact Analysis */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Timeline</span>
                    </div>
                    <div className={`flex items-center justify-center ${getImpactColor(recommendation.primaryOption.impact.timeline)}`}>
                      {getImpactIcon(recommendation.primaryOption.impact.timeline)}
                      <span className="ml-1 text-sm font-medium">
                        {recommendation.primaryOption.impact.timeline > 0 ? '+' : ''}{recommendation.primaryOption.impact.timeline}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Budget</span>
                    </div>
                    <div className={`flex items-center justify-center ${getImpactColor(recommendation.primaryOption.impact.budget)}`}>
                      {getImpactIcon(recommendation.primaryOption.impact.budget)}
                      <span className="ml-1 text-sm font-medium">
                        {recommendation.primaryOption.impact.budget > 0 ? '+' : ''}{recommendation.primaryOption.impact.budget}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Quality</span>
                    </div>
                    <div className={`flex items-center justify-center ${getImpactColor(recommendation.primaryOption.impact.quality)}`}>
                      {getImpactIcon(recommendation.primaryOption.impact.quality)}
                      <span className="ml-1 text-sm font-medium">
                        {recommendation.primaryOption.impact.quality > 0 ? '+' : ''}{recommendation.primaryOption.impact.quality}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Stakeholders</span>
                    </div>
                    <div className={`flex items-center justify-center ${getImpactColor(recommendation.primaryOption.impact.stakeholderSatisfaction)}`}>
                      {getImpactIcon(recommendation.primaryOption.impact.stakeholderSatisfaction)}
                      <span className="ml-1 text-sm font-medium">
                        {recommendation.primaryOption.impact.stakeholderSatisfaction > 0 ? '+' : ''}{recommendation.primaryOption.impact.stakeholderSatisfaction}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-gray-700 mb-2">AI Reasoning:</h5>
                  <p className="text-sm text-gray-600">{recommendation.primaryOption.reasoning}</p>
                </div>
              </div>

              {/* Key Factors */}
              <div>
                <h5 className="font-medium text-gray-700 mb-3">Key Factors Considered:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendation.keyFactors.map((factor, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Assessment */}
              <div>
                <h5 className="font-medium text-gray-700 mb-3">Risk Assessment:</h5>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Overall Risk Level:</span>
                  <Badge className={getRiskColor(recommendation.riskAssessment.overall)}>
                    {recommendation.riskAssessment.overall.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {recommendation.riskAssessment.criticalRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h5 className="font-medium text-gray-700 mb-3">Recommended Next Steps:</h5>
                <div className="space-y-2">
                  {recommendation.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-600">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => addToPendingDecisions(recommendation)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Add to Pending Decisions
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Save Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alternative Options (shown when details are expanded) */}
      {recommendation && showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Alternative Options</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendation.alternativeOptions.map((option) => (
                <div key={option.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{option.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 mb-2">
                        {option.successProbability}% Success Rate
                      </Badge>
                      <Badge variant="outline">
                        {option.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <h5 className="font-medium text-gray-700 mb-2">AI Reasoning:</h5>
                    <p className="text-sm text-gray-600">{option.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartDecisionEngine;
