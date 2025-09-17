import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, DollarSign, Users, Target, BarChart3, RefreshCw } from 'lucide-react';

interface RDCCrossProjectAnalysisProps {
  jurisdictionId: string;
  onClose: () => void;
}

interface RDCAnalysisResults {
  jurisdictionName: string;
  totalProjects: number;
  totalPMs: number;
  riskPatterns: RDCRiskPattern[];
  resourceConflicts: RDCResourceConflict[];
  optimizationInsights: RDCOptimizationInsight[];
  pmComparison: PMComparison[];
  summary: RDCSummary;
}

interface RDCRiskPattern {
  id: string;
  title: string;
  description: string;
  frequency: string;
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  affectedPMs: string[];
  affectedProjects: string[];
  costImpact: number;
  recommendation: string;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface RDCResourceConflict {
  id: string;
  resourceType: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  affectedPMs: string[];
  affectedProjects: string[];
  resolutionCost: number;
  resolutionOptions: string[];
  priority: 'immediate' | 'short_term' | 'long_term';
}

interface RDCOptimizationInsight {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  affectedPMs: string[];
  affectedProjects: string[];
  confidence: number;
  implementationEffort: 'Low' | 'Medium' | 'High';
  timeline: string;
}

interface PMComparison {
  pmId: string;
  pmName: string;
  projectCount: number;
  totalBudget: number;
  riskScore: number;
  onTimeDeliveryRate: number;
  costVariance: number;
  topRisks: string[];
}

interface RDCSummary {
  totalBudget: number;
  totalRiskCostImpact: number;
  totalOptimizationPotential: number;
  netRDCPosition: number;
  riskReductionPotential: number;
  efficiencyGainPotential: number;
}

const RDCCrossProjectAnalysis: React.FC<RDCCrossProjectAnalysisProps> = ({
  jurisdictionId,
  onClose
}) => {
  const [analysisResults, setAnalysisResults] = useState<RDCAnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('patterns');

  useEffect(() => {
    generateRDCAnalysis(jurisdictionId);
  }, [jurisdictionId]);

  const generateRDCAnalysis = async (jurisdictionId: string) => {
    setIsAnalyzing(true);

    // Simulate API call delay
    setTimeout(() => {
      const mockResults: RDCAnalysisResults = {
        jurisdictionName: "Georgetown RDC",
        totalProjects: 24,
        totalPMs: 6,
        riskPatterns: [
          {
            id: 'rdc-weather-cluster',
            title: 'Weather Impact Cluster',
            description: 'Coordinated weather delay patterns affecting infrastructure projects across multiple PM portfolios',
            frequency: '85%',
            impact: 'High',
            affectedPMs: ['PM-1', 'PM-3', 'PM-4', 'PM-5'],
            affectedProjects: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'Central Village Infrastructure', 'East Coast Highway'],
            costImpact: 78000,
            recommendation: 'Implement regional weather monitoring system and coordinated contingency planning across all PMs',
            confidence: 94,
            trend: 'increasing'
          },
          {
            id: 'material-supply-chain',
            title: 'Regional Material Shortages',
            description: 'Coordinated material procurement challenges affecting multiple PMs simultaneously',
            frequency: '72%',
            impact: 'Critical',
            affectedPMs: ['PM-1', 'PM-2', 'PM-3', 'PM-6'],
            affectedProjects: ['Georgetown Hospital Expansion', 'Anna Regina Sports Complex', 'Central Village Infrastructure', 'South Georgetown Development'],
            costImpact: 125000,
            recommendation: 'Establish regional material procurement consortium and advance ordering system',
            confidence: 91,
            trend: 'stable'
          },
          {
            id: 'contractor-capacity-overload',
            title: 'Contractor Capacity Overload',
            description: 'Key contractors overloaded across multiple PM portfolios causing scheduling conflicts',
            frequency: '68%',
            impact: 'Medium',
            affectedPMs: ['PM-2', 'PM-4', 'PM-5', 'PM-6'],
            affectedProjects: ['Georgetown Hospital Expansion', 'East Coast Highway', 'South Georgetown Development', 'West Demerara Bridge'],
            costImpact: 45000,
            recommendation: 'Implement regional contractor capacity management system and cross-PM coordination protocol',
            confidence: 87,
            trend: 'increasing'
          }
        ],
        resourceConflicts: [
          {
            id: 'excavator-cluster',
            resourceType: 'Heavy Equipment',
            description: 'Critical shortage of excavators across 6 major projects',
            severity: 'Critical',
            affectedPMs: ['PM-1', 'PM-3', 'PM-4'],
            affectedProjects: ['Anna Regina Sports Complex', 'Georgetown Road Repairs', 'East Coast Highway'],
            resolutionCost: 35000,
            resolutionOptions: ['Lease additional equipment', 'Reschedule projects', 'Regional equipment sharing pool'],
            priority: 'immediate'
          },
          {
            id: 'skilled-labor-shortage',
            resourceType: 'Skilled Labor',
            description: 'Shortage of specialized construction workers across multiple projects',
            severity: 'High',
            affectedPMs: ['PM-2', 'PM-5', 'PM-6'],
            affectedProjects: ['Georgetown Hospital Expansion', 'South Georgetown Development', 'West Demerara Bridge'],
            resolutionCost: 25000,
            resolutionOptions: ['Training programs', 'Contractor partnerships', 'Regional labor pool'],
            priority: 'short_term'
          }
        ],
        optimizationInsights: [
          {
            id: 'regional-bulk-procurement',
            title: 'Regional Bulk Procurement Program',
            description: 'Consolidated procurement of common materials across all RDC projects',
            potentialSavings: 180000,
            affectedPMs: ['PM-1', 'PM-2', 'PM-3', 'PM-4', 'PM-5', 'PM-6'],
            affectedProjects: ['All infrastructure and building projects'],
            confidence: 96,
            implementationEffort: 'Medium',
            timeline: '3-6 months'
          },
          {
            id: 'regional-contractor-allocation',
            title: 'Regional Contractor Optimization',
            description: 'Optimized allocation of contractors across projects to reduce idle time',
            potentialSavings: 95000,
            affectedPMs: ['PM-2', 'PM-4', 'PM-5', 'PM-6'],
            affectedProjects: ['Major construction projects'],
            confidence: 89,
            implementationEffort: 'High',
            timeline: '2-4 months'
          },
          {
            id: 'centralized-weather-response',
            title: 'Centralized Weather Response System',
            description: 'Regional weather monitoring and coordinated response strategy',
            potentialSavings: 65000,
            affectedPMs: ['PM-1', 'PM-3', 'PM-4', 'PM-5'],
            affectedProjects: ['All outdoor construction projects'],
            confidence: 92,
            implementationEffort: 'Low',
            timeline: '1-2 months'
          }
        ],
        pmComparison: [
          {
            pmId: 'PM-1',
            pmName: 'John Smith',
            projectCount: 5,
            totalBudget: 2500000,
            riskScore: 7.2,
            onTimeDeliveryRate: 85,
            costVariance: 8.5,
            topRisks: ['Weather delays', 'Material shortages']
          },
          {
            pmId: 'PM-2',
            pmName: 'Sarah Johnson',
            projectCount: 4,
            totalBudget: 1800000,
            riskScore: 6.8,
            onTimeDeliveryRate: 92,
            costVariance: 5.2,
            topRisks: ['Contractor capacity', 'Labor shortages']
          },
          {
            pmId: 'PM-3',
            pmName: 'Michael Brown',
            projectCount: 6,
            totalBudget: 3200000,
            riskScore: 8.1,
            onTimeDeliveryRate: 78,
            costVariance: 12.3,
            topRisks: ['Weather delays', 'Equipment conflicts']
          },
          {
            pmId: 'PM-4',
            pmName: 'Emily Davis',
            projectCount: 4,
            totalBudget: 2100000,
            riskScore: 6.5,
            onTimeDeliveryRate: 88,
            costVariance: 6.8,
            topRisks: ['Material supply', 'Scheduling conflicts']
          },
          {
            pmId: 'PM-5',
            pmName: 'David Wilson',
            projectCount: 3,
            totalBudget: 1500000,
            riskScore: 7.5,
            onTimeDeliveryRate: 82,
            costVariance: 9.7,
            topRisks: ['Contractor overload', 'Weather impact']
          },
          {
            pmId: 'PM-6',
            pmName: 'Lisa Anderson',
            projectCount: 2,
            totalBudget: 1200000,
            riskScore: 6.2,
            onTimeDeliveryRate: 95,
            costVariance: 4.1,
            topRisks: ['Labor shortages', 'Material supply']
          }
        ],
        summary: {
          totalBudget: 12300000,
          totalRiskCostImpact: 283000,
          totalOptimizationPotential: 340000,
          netRDCPosition: 57000,
          riskReductionPotential: 23,
          efficiencyGainPotential: 18
        }
      };

      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Analyzing RDC Portfolio</h3>
              <p className="text-sm text-gray-600">Aggregating data across all PMs and projects...</p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-xs text-center text-gray-500">Processing cross-PM patterns and resource conflicts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisResults) {
    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to generate RDC analysis. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <span>RDC Cross-Project Risk Analysis</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {analysisResults.jurisdictionName} • {analysisResults.totalProjects} projects • {analysisResults.totalPMs} PMs
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateRDCAnalysis(jurisdictionId)}
                disabled={isAnalyzing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                Re-analyze
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-xl font-bold">${analysisResults.summary.totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Impact</p>
                <p className="text-xl font-bold text-red-600">${analysisResults.summary.totalRiskCostImpact.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Optimization Potential</p>
                <p className="text-xl font-bold text-blue-600">${analysisResults.summary.totalOptimizationPotential.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Net Position</p>
                <p className={`text-xl font-bold ${analysisResults.summary.netRDCPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(analysisResults.summary.netRDCPosition).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patterns">Risk Patterns</TabsTrigger>
              <TabsTrigger value="conflicts">Resource Conflicts</TabsTrigger>
              <TabsTrigger value="insights">Optimization Insights</TabsTrigger>
              <TabsTrigger value="comparison">PM Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="patterns" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cross-PM Risk Patterns</h3>
                <p className="text-sm text-gray-600">
                  Patterns affecting multiple PMs and projects across the RDC
                </p>

                {analysisResults.riskPatterns.map((pattern) => (
                  <Card key={pattern.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{pattern.title}</h4>
                            <Badge className={getImpactColor(pattern.impact)}>
                              {pattern.impact}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getTrendIcon(pattern.trend)}
                              <span className="text-xs text-gray-500 capitalize">{pattern.trend}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Frequency</p>
                              <p className="text-sm font-semibold">{pattern.frequency}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Cost Impact</p>
                              <p className="text-sm font-semibold text-red-600">${pattern.costImpact.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Confidence</p>
                              <p className="text-sm font-semibold">{pattern.confidence}%</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Affected PMs</p>
                              <p className="text-sm font-semibold">{pattern.affectedPMs.length}</p>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <h5 className="text-sm font-medium text-blue-900 mb-1">Recommendation</h5>
                            <p className="text-sm text-blue-800">{pattern.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="conflicts" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resource Conflicts</h3>
                <p className="text-sm text-gray-600">
                  Critical resource conflicts requiring immediate attention
                </p>

                {analysisResults.resourceConflicts.map((conflict) => (
                  <Card key={conflict.id} className={`border-l-4 ${
                    conflict.severity === 'Critical' ? 'border-l-red-500' :
                    conflict.severity === 'High' ? 'border-l-orange-500' :
                    conflict.severity === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{conflict.resourceType} Conflict</h4>
                            <Badge className={getSeverityColor(conflict.severity)}>
                              {conflict.severity}
                            </Badge>
                            <Badge variant="outline" className={
                              conflict.priority === 'immediate' ? 'border-red-300 text-red-700' :
                              conflict.priority === 'short_term' ? 'border-orange-300 text-orange-700' :
                              'border-blue-300 text-blue-700'
                            }>
                              {conflict.priority.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{conflict.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Affected PMs</p>
                              <p className="text-sm font-semibold">{conflict.affectedPMs.length}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Resolution Cost</p>
                              <p className="text-sm font-semibold text-orange-600">${conflict.resolutionCost.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Options</p>
                              <p className="text-sm font-semibold">{conflict.resolutionOptions.length} available</p>
                            </div>
                          </div>

                          <div className="bg-orange-50 p-3 rounded border border-orange-200">
                            <h5 className="text-sm font-medium text-orange-900 mb-2">Resolution Options</h5>
                            <ul className="text-sm text-orange-800 space-y-1">
                              {conflict.resolutionOptions.map((option, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                  <span>{option}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Optimization Insights</h3>
                <p className="text-sm text-gray-600">
                  Opportunities to improve efficiency and reduce costs across the RDC
                </p>

                {analysisResults.optimizationInsights.map((insight) => (
                  <Card key={insight.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                            <Badge className="bg-green-100 text-green-800">
                              ${insight.potentialSavings.toLocaleString()} savings
                            </Badge>
                            <Badge variant="outline" className={
                              insight.implementationEffort === 'Low' ? 'border-green-300 text-green-700' :
                              insight.implementationEffort === 'Medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-red-300 text-red-700'
                            }>
                              {insight.implementationEffort} effort
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Affected PMs</p>
                              <p className="text-sm font-semibold">{insight.affectedPMs.length}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Confidence</p>
                              <p className="text-sm font-semibold">{insight.confidence}%</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Timeline</p>
                              <p className="text-sm font-semibold">{insight.timeline}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Potential Impact</p>
                              <p className="text-sm font-semibold text-green-600">${insight.potentialSavings.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PM Performance Comparison</h3>
                <p className="text-sm text-gray-600">
                  Comparative analysis of PM performance across the RDC
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Variance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Risks</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResults.pmComparison.map((pm) => (
                        <tr key={pm.pmId} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{pm.pmName}</div>
                                <div className="text-sm text-gray-500">{pm.pmId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pm.projectCount}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${pm.totalBudget.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              pm.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                              pm.riskScore >= 7 ? 'bg-orange-100 text-orange-800' :
                              pm.riskScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {pm.riskScore}/10
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pm.onTimeDeliveryRate}%
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={pm.costVariance > 10 ? 'text-red-600' : pm.costVariance > 5 ? 'text-orange-600' : 'text-green-600'}>
                              {pm.costVariance}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            <div className="flex flex-wrap gap-1">
                              {pm.topRisks.map((risk, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {risk}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RDCCrossProjectAnalysis;
