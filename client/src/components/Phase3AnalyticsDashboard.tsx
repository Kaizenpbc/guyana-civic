import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle,
  Download,
  RefreshCw,
  Target,
  Zap,
  Clock,
  DollarSign,
  Users,
  Shield,
  Activity
} from 'lucide-react';

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down';
  change: number;
}

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'critical';
  timestamp: string;
}

interface AnalyticsData {
  lastUpdated: string;
  performanceTrends: any[];
  budgetAnalytics: any;
  predictiveInsights: any[];
  riskAnalytics: any;
  efficiencyMetrics: any;
  kpiMetrics: KPIMetric[];
  alerts: AlertItem[];
}

const Phase3AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('onTimeDelivery');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      const mockData: AnalyticsData = {
        lastUpdated: new Date().toISOString(),
        performanceTrends: [
          { period: "Q1 2024", onTimeDelivery: 78, budgetVariance: 8.5, riskScore: 7.2, completedProjects: 3, trend: "improving" },
          { period: "Q2 2024", onTimeDelivery: 82, budgetVariance: 6.2, riskScore: 6.8, completedProjects: 4, trend: "stable" },
          { period: "Q3 2024", onTimeDelivery: 85, budgetVariance: 4.8, riskScore: 6.4, completedProjects: 5, trend: "improving" },
          { period: "Q4 2024", onTimeDelivery: 87, budgetVariance: 3.2, riskScore: 6.1, completedProjects: 6, trend: "improving" }
        ],
        budgetAnalytics: {
          totalAllocated: 12500000,
          totalSpent: 8750000,
          utilizationRate: 70,
          forecastAccuracy: 85,
          savingsOpportunities: 380000,
          monthlySpend: [1250000, 1180000, 1320000, 1150000, 1280000, 1220000],
          budgetCategories: [
            { category: "Infrastructure", allocated: 5200000, spent: 3640000, remaining: 1560000, utilization: 70 },
            { category: "Education", allocated: 3800000, spent: 2660000, remaining: 1140000, utilization: 70 },
            { category: "Healthcare", allocated: 2500000, spent: 1750000, remaining: 750000, utilization: 70 },
            { category: "Transportation", allocated: 1000000, spent: 700000, remaining: 300000, utilization: 70 }
          ]
        },
        predictiveInsights: [
          {
            id: "pred-1",
            type: "delay_risk",
            title: "Infrastructure Project Delay Predicted",
            confidence: 78,
            impact: "medium",
            recommendation: "Schedule indoor work first",
            timeframe: "Next 30 days",
            affectedProjects: 3,
            potentialDelay: "2-3 weeks"
          },
          {
            id: "pred-2",
            type: "budget_overrun",
            title: "Material Cost Increase Expected",
            confidence: 82,
            impact: "high",
            recommendation: "Lock in supplier contracts",
            timeframe: "Next 60 days",
            affectedProjects: 5,
            potentialIncrease: "15-20%"
          }
        ],
        riskAnalytics: {
          currentRiskScore: 6.4,
          riskTrend: "improving",
          riskDistribution: { low: 12, medium: 8, high: 3, critical: 1 },
          highRiskProjects: 2,
          mitigationEffectiveness: 78,
          riskReductionPotential: 23
        },
        efficiencyMetrics: {
          averageProjectDuration: "8.5 months",
          resourceUtilization: 78,
          processEfficiency: 82,
          decisionSpeed: "4.2 days average",
          reworkRate: 12,
          productivityIndex: 87,
          qualityScore: 84,
          customerSatisfaction: 91
        },
        kpiMetrics: [
          { id: "kpi-1", name: "On-Time Delivery", value: 85, target: 90, unit: "%", trend: "up", change: 5.2 },
          { id: "kpi-2", name: "Budget Variance", value: 4.8, target: 5.0, unit: "%", trend: "down", change: -0.8 },
          { id: "kpi-3", name: "Risk Score", value: 6.4, target: 6.0, unit: "/10", trend: "down", change: -0.3 },
          { id: "kpi-4", name: "Resource Utilization", value: 78, target: 85, unit: "%", trend: "up", change: 3.1 }
        ],
        alerts: [
          {
            id: "alert-1",
            type: "warning",
            title: "Budget Threshold Exceeded",
            message: "Infrastructure projects have exceeded 80% of allocated budget",
            priority: "high",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "alert-2",
            type: "info",
            title: "Positive Trend Detected",
            message: "On-time delivery rate improved by 5.2% this quarter",
            priority: "medium",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      };

      setAnalyticsData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setLoading(false);
    }
  };

  const generateReport = async (reportType: string, format: string) => {
    try {
      // In a real app, this would make an API call
      console.log(`Generating ${reportType} report in ${format} format`);

      // Mock report generation
      const reportData = {
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
        generatedAt: new Date().toISOString(),
        format,
        status: "completed"
      };

      alert(`Report generated successfully!\n\nTitle: ${reportData.title}\nFormat: ${reportData.format}\nStatus: ${reportData.status}`);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getKPIStatus = (metric: KPIMetric) => {
    const variance = ((metric.value - metric.target) / metric.target) * 100;
    if (Math.abs(variance) <= 5) return { status: 'on-target', color: 'bg-green-100 text-green-800' };
    if (variance > 5) return { status: 'above-target', color: 'bg-blue-100 text-blue-800' };
    return { status: 'below-target', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Unable to load analytics data. Please try again.</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phase 3 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Advanced analytics with real-time insights and predictive capabilities
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsData.kpiMetrics.map((kpi) => {
          const status = getKPIStatus(kpi);
          return (
            <Card key={kpi.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpi.value}{kpi.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      Target: {kpi.target}{kpi.unit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <Badge className={status.color}>
                      {status.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className={`font-medium ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change >= 0 ? '+' : ''}{kpi.change}{kpi.unit}
                    </span>
                    <span className="text-gray-500 ml-1">from last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="kpi-builder">KPI Builder</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.performanceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{trend.period}</p>
                        <p className="text-sm text-gray-600">
                          {trend.completedProjects} projects completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          On-Time: {trend.onTimeDelivery}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Risk: {trend.riskScore}/10
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Predictive Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-purple-600" />
                  Predictive Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.predictiveInsights.map((insight) => (
                    <div key={insight.id} className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-900">{insight.title}</h4>
                        <Badge className="bg-purple-100 text-purple-800">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-800 mb-2">{insight.recommendation}</p>
                      <div className="flex items-center justify-between text-xs text-purple-600">
                        <span>{insight.timeframe}</span>
                        <span>{insight.affectedProjects} projects affected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Budget Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(analyticsData.budgetAnalytics.totalAllocated / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">Total Allocated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(analyticsData.budgetAnalytics.totalSpent / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analyticsData.budgetAnalytics.utilizationRate}%
                  </p>
                  <p className="text-sm text-gray-600">Utilization Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    ${(analyticsData.budgetAnalytics.savingsOpportunities / 1000).toFixed(0)}K
                  </p>
                  <p className="text-sm text-gray-600">Savings Potential</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Budget by Category</h4>
                {analyticsData.budgetAnalytics.budgetCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-600">
                        ${(category.allocated / 1000000).toFixed(1)}M allocated
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{category.utilization}%</p>
                      <p className="text-sm text-gray-600">utilized</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                Advanced Forecasting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onTimeDelivery">On-Time Delivery</SelectItem>
                        <SelectItem value="budgetVariance">Budget Variance</SelectItem>
                        <SelectItem value="riskScore">Risk Score</SelectItem>
                        <SelectItem value="resourceUtilization">Resource Utilization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">Forecast Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-indigo-700">Current Value</p>
                      <p className="text-2xl font-bold text-indigo-900">85%</p>
                    </div>
                    <div>
                      <p className="text-sm text-indigo-700">6-Month Forecast</p>
                      <p className="text-2xl font-bold text-indigo-900">89%</p>
                    </div>
                    <div>
                      <p className="text-sm text-indigo-700">Confidence Level</p>
                      <p className="text-2xl font-bold text-indigo-900">78%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-green-600" />
                Automated Report Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => generateReport('performance', 'pdf')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Target className="h-6 w-6" />
                  <span>Performance Report</span>
                </Button>

                <Button
                  onClick={() => generateReport('budget', 'excel')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <DollarSign className="h-6 w-6" />
                  <span>Budget Report</span>
                </Button>

                <Button
                  onClick={() => generateReport('risk', 'pdf')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Shield className="h-6 w-6" />
                  <span>Risk Report</span>
                </Button>

                <Button
                  onClick={() => generateReport('executive', 'pdf')}
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                >
                  <Users className="h-6 w-6" />
                  <span>Executive Summary</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Available Formats</h4>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">Excel</Badge>
                  <Badge variant="outline">JSON</Badge>
                  <span className="text-sm text-gray-500">More formats coming soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-600" />
                Custom KPI Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">KPI Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Contractor Performance Index"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="efficiency">Efficiency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., (onTimeDelivery * 0.6) + (qualityScore * 0.4)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Min</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Max</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                    />
                  </div>
                </div>

                <Button className="w-full">
                  Create Custom KPI
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                System Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.alerts.map((alert) => (
                  <Alert key={alert.id} className={`border-l-4 ${
                    alert.type === 'critical' ? 'border-l-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{alert.title}</h4>
                          <Badge className={`${
                            alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <AlertDescription className="mt-1">
                          {alert.message}
                        </AlertDescription>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>

              {analyticsData.alerts.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                  <p className="text-gray-500">No active alerts or notifications at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Phase3AnalyticsDashboard;
