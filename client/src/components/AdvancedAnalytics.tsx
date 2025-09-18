import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface AdvancedAnalyticsProps {
  projectId: string;
}

interface AnalyticsData {
  timeline: {
    planned: number;
    actual: number;
    variance: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    variance: number;
  };
  resources: {
    total: number;
    allocated: number;
    utilization: number;
  };
  quality: {
    score: number;
    defects: number;
    rework: number;
  };
  risks: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

export default function AdvancedAnalytics({ projectId }: AdvancedAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  const analyticsData: AnalyticsData = {
    timeline: {
      planned: 100,
      actual: 85,
      variance: -15
    },
    budget: {
      allocated: 2500000,
      spent: 1625000,
      remaining: 875000,
      variance: -2.5
    },
    resources: {
      total: 12,
      allocated: 10,
      utilization: 83.3
    },
    quality: {
      score: 87,
      defects: 3,
      rework: 5
    },
    risks: {
      total: 8,
      high: 2,
      medium: 4,
      low: 2
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GY', {
      style: 'currency',
      currency: 'GYD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < -10) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4" />;
    if (variance < -10) return <TrendingDown className="h-4 w-4" />;
    return <Target className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Advanced Analytics</CardTitle>
                <p className="text-sm text-gray-600">Deep insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Week
              </Button>
              <Button 
                variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Month
              </Button>
              <Button 
                variant={selectedPeriod === 'quarter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedPeriod('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Timeline Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline Performance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.timeline.actual}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`flex items-center space-x-1 ${getVarianceColor(analyticsData.timeline.variance)}`}>
                {getVarianceIcon(analyticsData.timeline.variance)}
                <span className="text-sm">{analyticsData.timeline.variance}%</span>
              </div>
              <span className="text-xs text-muted-foreground">vs planned</span>
            </div>
            <Progress value={analyticsData.timeline.actual} className="mt-2" />
          </CardContent>
        </Card>

        {/* Budget Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.budget.spent)}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className={`flex items-center space-x-1 ${getVarianceColor(analyticsData.budget.variance)}`}>
                {getVarianceIcon(analyticsData.budget.variance)}
                <span className="text-sm">{analyticsData.budget.variance}%</span>
              </div>
              <span className="text-xs text-muted-foreground">variance</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatCurrency(analyticsData.budget.remaining)} remaining
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.resources.utilization.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-2">
              {analyticsData.resources.allocated} of {analyticsData.resources.total} resources
            </div>
            <Progress value={analyticsData.resources.utilization} className="mt-2" />
          </CardContent>
        </Card>

        {/* Quality Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.quality.score}/100</div>
            <div className="text-sm text-muted-foreground mt-2">
              {analyticsData.quality.defects} defects, {analyticsData.quality.rework} rework items
            </div>
            <Progress value={analyticsData.quality.score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Schedule Adherence</span>
                <div className="flex items-center space-x-2">
                  <Progress value={85} className="w-20" />
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget Efficiency</span>
                <div className="flex items-center space-x-2">
                  <Progress value={92} className="w-20" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Metrics</span>
                <div className="flex items-center space-x-2">
                  <Progress value={87} className="w-20" />
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Team Productivity</span>
                <div className="flex items-center space-x-2">
                  <Progress value={78} className="w-20" />
                  <span className="text-sm font-medium">78%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Risk Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">High Risk</span>
                </div>
                <Badge className="bg-red-100 text-red-800">{analyticsData.risks.high}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Medium Risk</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{analyticsData.risks.medium}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Low Risk</span>
                </div>
                <Badge className="bg-green-100 text-green-800">{analyticsData.risks.low}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Risks</span>
                  <span className="text-sm font-bold">{analyticsData.risks.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span>Predictive Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">92%</div>
              <div className="text-sm text-gray-600">Completion Probability</div>
              <div className="text-xs text-gray-500 mt-1">Based on current trends</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+5 days</div>
              <div className="text-sm text-gray-600">Early Delivery</div>
              <div className="text-xs text-gray-500 mt-1">If current pace continues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">$125K</div>
              <div className="text-sm text-gray-600">Potential Savings</div>
              <div className="text-xs text-gray-500 mt-1">With optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-indigo-600" />
            <span>Analytics-Driven Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Optimize Resource Allocation</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Reallocate 2 team members from low-priority tasks to critical path activities to improve timeline performance by 12%.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Budget Optimization</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Reduce scope creep by 15% to stay within budget and improve cost efficiency by 8%.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Optimize Budget
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Timeline Acceleration</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Implement parallel processing for tasks 3-7 to reduce project duration by 5 days.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Accelerate Timeline
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