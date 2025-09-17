import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Zap,
  Clock,
  Users,
  Activity
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  projects: any[];
  onClose: () => void;
}

interface AnalyticsData {
  performanceTrends: PerformanceTrend[];
  budgetAnalytics: BudgetAnalytics;
  riskAnalysis: RiskAnalysis;
  predictiveInsights: PredictiveInsight[];
  efficiencyMetrics: EfficiencyMetrics;
}

interface PerformanceTrend {
  period: string;
  onTimeDelivery: number;
  budgetVariance: number;
  riskScore: number;
  completedProjects: number;
}

interface BudgetAnalytics {
  totalAllocated: number;
  totalSpent: number;
  utilizationRate: number;
  forecastAccuracy: number;
  costOverruns: number;
  savingsOpportunities: number;
}

interface RiskAnalysis {
  currentRiskScore: number;
  riskTrend: 'improving' | 'stable' | 'worsening';
  highRiskProjects: number;
  mitigationEffectiveness: number;
  riskCategories: RiskCategory[];
}

interface RiskCategory {
  category: string;
  count: number;
  impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PredictiveInsight {
  type: 'delay_risk' | 'budget_overrun' | 'resource_conflict' | 'success_prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  recommendation: string;
}

interface EfficiencyMetrics {
  averageProjectDuration: number;
  resourceUtilization: number;
  processEfficiency: number;
  decisionSpeed: number;
  reworkRate: number;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  projects,
  onClose
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    generateAnalytics(projects);
  }, [projects]);

  const generateAnalytics = async (projects: any[]) => {
    setIsAnalyzing(true);

    // Simulate AI analysis delay
    setTimeout(() => {
      const mockAnalytics: AnalyticsData = {
        performanceTrends: [
          { period: 'Q1 2024', onTimeDelivery: 78, budgetVariance: 8.5, riskScore: 7.2, completedProjects: 3 },
          { period: 'Q2 2024', onTimeDelivery: 82, budgetVariance: 6.2, riskScore: 6.8, completedProjects: 4 },
          { period: 'Q3 2024', onTimeDelivery: 85, budgetVariance: 4.1, riskScore: 6.5, completedProjects: 5 },
          { period: 'Q4 2024', onTimeDelivery: 88, budgetVariance: 3.8, riskScore: 6.2, completedProjects: 6 }
        ],
        budgetAnalytics: {
          totalAllocated: 12500000,
          totalSpent: 8750000,
          utilizationRate: 70,
          forecastAccuracy: 85,
          costOverruns: 250000,
          savingsOpportunities: 380000
        },
        riskAnalysis: {
          currentRiskScore: 6.4,
          riskTrend: 'improving',
          highRiskProjects: 2,
          mitigationEffectiveness: 78,
          riskCategories: [
            { category: 'Weather Impact', count: 8, impact: 7.5, trend: 'decreasing' },
            { category: 'Material Supply', count: 6, impact: 6.8, trend: 'stable' },
            { category: 'Contractor Capacity', count: 4, impact: 6.2, trend: 'improving' },
            { category: 'Budget Variance', count: 5, impact: 5.9, trend: 'decreasing' }
          ]
        },
        predictiveInsights: [
          {
            type: 'delay_risk',
            title: 'Infrastructure Project Delay Predicted',
            description: 'Anna Regina Sports Complex shows 65% probability of 2-week delay due to weather patterns',
            confidence: 78,
            impact: 'medium',
            timeframe: 'Next 3 weeks',
            recommendation: 'Schedule indoor work first and prepare contingency weather response plan'
          },
          {
            type: 'budget_overrun',
            title: 'Cost Overrun Risk Detected',
            description: 'Georgetown Hospital Expansion trending toward 12% budget overrun',
            confidence: 82,
            impact: 'high',
            timeframe: 'Next 2 months',
            recommendation: 'Implement cost monitoring dashboard and identify $45K in potential savings'
          },
          {
            type: 'success_prediction',
            title: 'High Success Probability',
            description: 'Charity Market Infrastructure has 94% chance of on-time completion',
            confidence: 94,
            impact: 'low',
            timeframe: 'Next month',
            recommendation: 'Monitor closely as success model - consider replicating best practices'
          },
          {
            type: 'resource_conflict',
            title: 'Resource Bottleneck Alert',
            description: 'Critical equipment shortage predicted for Q1 2025 across 3 projects',
            confidence: 71,
            impact: 'critical',
            timeframe: 'January 2025',
            recommendation: 'Begin advance procurement planning and consider equipment leasing options'
          }
        ],
        efficiencyMetrics: {
          averageProjectDuration: 8.5, // months
          resourceUtilization: 78,
          processEfficiency: 82,
          decisionSpeed: 4.2, // days average
          reworkRate: 12
        }
      };

      setAnalyticsData(mockAnalytics);
      setIsAnalyzing(false);
    }, 2500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isAnalyzing) {
    return (
      <Card className="w-full max-w-7xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">Generating Advanced Analytics</h3>
              <p className="text-sm text-gray-600">Analyzing performance trends, budget data, and predictive insights...</p>
            </div>
          </div>
          <div className="w-full max-w-md">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-center text-gray-500">Processing historical data and generating predictions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) {
    return (
      <Card className="w-full max-w-7xl mx-auto">
        <CardContent className="flex items-center justify-center py-16">
          <Alert className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unable to generate analytics. Please check your data and try again.
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
                <span>Advanced Analytics Dashboard</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Performance trends, predictive insights, and optimization recommendations
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateAnalytics(projects)}
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg On-Time Delivery</p>
                <p className="text-xl font-bold text-green-600">
                  {analyticsData.performanceTrends.slice(-1)[0]?.onTimeDelivery || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                <p className="text-xl font-bold text-blue-600">
                  {analyticsData.budgetAnalytics.utilizationRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-xl font-bold text-orange-600">
                  {analyticsData.riskAnalysis.currentRiskScore}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-xl font-bold text-purple-600">
                  {analyticsData.efficiencyMetrics.processEfficiency}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance Trends</TabsTrigger>
              <TabsTrigger value="budget">Budget Analytics</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Portfolio Overview</h3>

                {/* Risk Analysis Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Current Risk Score</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{analyticsData.riskAnalysis.currentRiskScore}/10</span>
                            {getTrendIcon(analyticsData.riskAnalysis.riskTrend)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">High Risk Projects</span>
                          <Badge variant="outline" className="text-red-600">
                            {analyticsData.riskAnalysis.highRiskProjects}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Mitigation Effectiveness</span>
                          <span className="font-semibold text-green-600">
                            {analyticsData.riskAnalysis.mitigationEffectiveness}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg Project Duration</span>
                          <span className="font-semibold">{analyticsData.efficiencyMetrics.averageProjectDuration} months</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Resource Utilization</span>
                          <span className="font-semibold text-blue-600">
                            {analyticsData.efficiencyMetrics.resourceUtilization}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rework Rate</span>
                          <span className="font-semibold text-orange-600">
                            {analyticsData.efficiencyMetrics.reworkRate}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Risk Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Risk Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analyticsData.riskAnalysis.riskCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{category.category}</p>
                            <p className="text-xs text-gray-600">{category.count} instances</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-semibold">Impact: {category.impact}/10</p>
                            </div>
                            {getTrendIcon(category.trend)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Performance Trends</h3>
                <p className="text-sm text-gray-600">
                  Historical performance analysis and trend identification
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Delivery</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Variance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.performanceTrends.map((trend, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {trend.period}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trend.onTimeDelivery >= 85 ? 'bg-green-100 text-green-800' :
                              trend.onTimeDelivery >= 75 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {trend.onTimeDelivery}%
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={trend.budgetVariance > 5 ? 'text-red-600' : trend.budgetVariance > 2 ? 'text-orange-600' : 'text-green-600'}>
                              {trend.budgetVariance}%
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trend.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                              trend.riskScore >= 6 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {trend.riskScore}/10
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trend.completedProjects}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="budget" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Budget Analytics</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive budget analysis and forecasting insights
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">
                          ${(analyticsData.budgetAnalytics.totalAllocated / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-sm text-gray-600">Total Allocated</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">
                          {analyticsData.budgetAnalytics.utilizationRate}%
                        </p>
                        <p className="text-sm text-gray-600">Utilization Rate</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">
                          ${analyticsData.budgetAnalytics.savingsOpportunities.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Savings Opportunities</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Budget Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Forecast Accuracy</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Current Quarter</span>
                            <span className="text-sm font-medium">{analyticsData.budgetAnalytics.forecastAccuracy}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${analyticsData.budgetAnalytics.forecastAccuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Cost Analysis</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Cost Overruns</span>
                            <span className="text-sm font-medium text-red-600">
                              ${analyticsData.budgetAnalytics.costOverruns.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Savings Potential</span>
                            <span className="text-sm font-medium text-green-600">
                              ${analyticsData.budgetAnalytics.savingsOpportunities.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="predictions" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">AI-Powered Predictions</h3>
                <p className="text-sm text-gray-600">
                  Predictive insights and recommendations based on historical data and current trends
                </p>

                <div className="space-y-4">
                  {analyticsData.predictiveInsights.map((insight, index) => (
                    <Card key={index} className={`border-l-4 ${
                      insight.type === 'delay_risk' ? 'border-l-orange-500' :
                      insight.type === 'budget_overrun' ? 'border-l-red-500' :
                      insight.type === 'resource_conflict' ? 'border-l-purple-500' :
                      'border-l-green-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact.toUpperCase()}
                              </Badge>
                              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                                insight.confidence >= 80 ? 'bg-green-100 text-green-800' :
                                insight.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                <Brain className="h-3 w-3" />
                                <span>{insight.confidence}% confident</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{insight.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Timeframe</p>
                                <p className="text-sm font-semibold">{insight.timeframe}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Impact Level</p>
                                <p className="text-sm font-semibold capitalize">{insight.impact}</p>
                              </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <h5 className="text-sm font-medium text-blue-900 mb-1">AI Recommendation</h5>
                              <p className="text-sm text-blue-800">{insight.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    These predictions are generated using advanced AI algorithms analyzing your historical project data,
                    current trends, and external factors. Confidence levels indicate the reliability of each prediction.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
