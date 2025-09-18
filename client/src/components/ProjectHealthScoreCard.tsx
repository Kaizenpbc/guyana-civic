import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  Activity,
  RefreshCw,
  BarChart3
} from 'lucide-react';

interface ProjectHealthScoreCardProps {
  projectId: string;
}

interface HealthMetric {
  name: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
  lastUpdated: string;
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  createdAt: string;
}

export default function ProjectHealthScoreCard({ projectId }: ProjectHealthScoreCardProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  const overallHealthScore = 78;
  const confidence = 85;
  
  const healthMetrics: HealthMetric[] = [
    {
      name: 'Timeline Health',
      score: 75,
      maxScore: 100,
      trend: 'up',
      status: 'good',
      description: 'Project is on track with minor delays',
      lastUpdated: '2024-10-15T10:30:00Z'
    },
    {
      name: 'Budget Health',
      score: 82,
      maxScore: 100,
      trend: 'stable',
      status: 'excellent',
      description: 'Budget utilization is optimal',
      lastUpdated: '2024-10-15T09:15:00Z'
    },
    {
      name: 'Resource Health',
      score: 70,
      maxScore: 100,
      trend: 'down',
      status: 'fair',
      description: 'Resource allocation needs optimization',
      lastUpdated: '2024-10-15T08:45:00Z'
    },
    {
      name: 'Quality Health',
      score: 85,
      maxScore: 100,
      trend: 'up',
      status: 'excellent',
      description: 'Quality metrics are above target',
      lastUpdated: '2024-10-15T11:20:00Z'
    },
    {
      name: 'Risk Health',
      score: 65,
      maxScore: 100,
      trend: 'down',
      status: 'fair',
      description: 'Several medium-risk items require attention',
      lastUpdated: '2024-10-15T07:30:00Z'
    }
  ];

  const healthAlerts: HealthAlert[] = [
    {
      id: 'alert-1',
      type: 'warning',
      title: 'Resource Utilization Below Optimal',
      description: 'Current resource utilization is 70%, below the recommended 85% threshold.',
      severity: 'medium',
      createdAt: '2024-10-15T08:45:00Z'
    },
    {
      id: 'alert-2',
      type: 'info',
      title: 'Quality Metrics Improving',
      description: 'Quality score has improved by 5% over the last week.',
      severity: 'low',
      createdAt: '2024-10-15T11:20:00Z'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Project Health Score</CardTitle>
                <p className="text-sm text-gray-600">AI-powered health assessment</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-green-600 mb-2">{overallHealthScore}/100</div>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">GOOD</Badge>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Improving</span>
              </div>
            </div>
            <Progress value={overallHealthScore} className="h-3 mb-4" />
            <div className="text-sm text-gray-600">
              Confidence: {confidence}% • Last updated: {formatDate(new Date().toISOString())}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{metric.score}/{metric.maxScore}</div>
              <Progress value={(metric.score / metric.maxScore) * 100} className="mb-3" />
              <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
              <div className="text-xs text-gray-500">
                Updated: {formatDate(metric.lastUpdated)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Health Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthAlerts.map((alert) => (
              <div key={alert.id} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="text-xs text-gray-500">
                      {formatDate(alert.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Health Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+5%</div>
                <div className="text-sm text-gray-600">Improvement this week</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Metrics improving</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">2</div>
                <div className="text-sm text-gray-600">Areas need attention</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Health Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Optimize Resource Allocation</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Reallocate 2 team members from low-priority tasks to improve resource health score by 15%.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Accelerate Timeline</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Implement parallel processing for tasks 3-7 to improve timeline health by 10%.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Optimize Timeline
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">Risk Mitigation</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    Address 2 high-priority risks to improve overall health score by 8%.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Mitigate Risks
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