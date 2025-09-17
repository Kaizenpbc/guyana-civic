import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Users, FileText, TrendingUp, AlertTriangle, Target, BarChart3, RefreshCw } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import RDCCrossProjectAnalysis from '@/components/RDCCrossProjectAnalysis';
import NotificationSystem, { type Notification } from '@/components/NotificationSystem';

// API function to get current user
const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await fetch('/api/auth/me', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
};

// API function to get RDC dashboard data
const getRDCDashboardData = async (): Promise<any> => {
  const response = await fetch('/api/rdc/dashboard', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch RDC dashboard data');
  }
  return response.json();
};

const RDCDashboard: React.FC = () => {
  const [location, navigate] = useLocation();
  const [showRDCAnalysis, setShowRDCAnalysis] = useState(false);

  const { data: authData, isLoading: authLoading, error: authError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch } = useQuery({
    queryKey: ['rdc', 'dashboard'],
    queryFn: getRDCDashboardData,
    enabled: !!authData?.user,
  });

  const user = authData?.user;

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (!authLoading && user && !['rdc_manager', 'minister', 'admin', 'super_admin'].includes(user.role)) {
      navigate('/unauthorized');
      return;
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RDC Dashboard...</p>
        </div>
      </div>
    );
  }

  if (authError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Authentication required. Please log in to access the RDC Dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!['rdc_manager', 'minister', 'admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. RDC Manager or higher privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RDC Manager Dashboard</h1>
                <p className="text-sm text-gray-600">
                  {dashboardData?.jurisdiction?.name || 'Regional Development Council'} • {user.role.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowRDCAnalysis(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Cross-PM Analysis
              </Button>
              <NotificationSystem
                userId={user.id}
                onNotificationClick={(notification) => {
                  console.log('Notification clicked:', notification);
                }}
              />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {dashboardLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-2 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : dashboardError ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load dashboard data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome, {user.fullName}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Manage regional projects, oversee PM performance, and drive cross-project optimization
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {dashboardData?.jurisdiction?.name || 'Regional Development Council'}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Project Managers</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary?.totalPMs || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dashboardData?.summary?.totalProjects || 0} total projects
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary?.activeProjects || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dashboardData?.summary?.completedProjects || 0} completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Budget</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(dashboardData?.summary?.totalBudget || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dashboardData?.summary?.budgetUtilization || 0}% utilized
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Optimization Potential</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(dashboardData?.summary?.optimizationPotential || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Risk score: {dashboardData?.summary?.riskScore || 0}/10
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Cross-PM Analysis</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Analyze patterns across all PMs, identify conflicts, and discover optimization opportunities
                  </p>
                  <Button
                    onClick={() => setShowRDCAnalysis(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Launch Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">PM Performance</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Monitor PM performance, track project delivery, and identify coaching opportunities
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{dashboardData?.summary?.totalPMs || 0}</p>
                      <p className="text-xs text-gray-600">Active PMs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {dashboardData?.summary?.projectCompletionRate || 0}%
                      </p>
                      <p className="text-xs text-gray-600">On-Time Rate</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Detailed Performance Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Target className="h-8 w-8 text-green-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Resource Optimization</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Optimize resource allocation, reduce conflicts, and maximize regional efficiency
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        ${(dashboardData?.summary?.optimizationPotential || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Potential Savings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {dashboardData?.summary?.riskScore || 0}/10
                      </p>
                      <p className="text-xs text-gray-600">Risk Score</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Optimize Resources
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* PM Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>PM Performance Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.pms?.slice(0, 5).map((pm: any) => (
                      <div key={pm.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{pm.name}</p>
                          <p className="text-sm text-gray-600">{pm.projectCount} projects</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${(pm.totalBudget || 0).toLocaleString()}</p>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-1 rounded-full ${
                              pm.riskScore >= 8 ? 'bg-red-100 text-red-800' :
                              pm.riskScore >= 7 ? 'bg-orange-100 text-orange-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Risk: {pm.riskScore}/10
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              pm.onTimeDeliveryRate >= 90 ? 'bg-green-100 text-green-800' :
                              pm.onTimeDeliveryRate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {pm.onTimeDeliveryRate}% on-time
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.recentActivity?.map((activity: any) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'project_completed' ? 'bg-green-100' :
                          activity.type === 'risk_escalated' ? 'bg-red-100' :
                          'bg-blue-100'
                        }`}>
                          {activity.type === 'project_completed' ? (
                            <Target className="h-4 w-4 text-green-600" />
                          ) : activity.type === 'risk_escalated' ? (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-xs">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-gray-500 text-xs">{activity.pm}</p>
                            <p className="text-gray-400 text-xs">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* RDC Analysis Modal */}
      {showRDCAnalysis && (
        <RDCCrossProjectAnalysis
          jurisdictionId={dashboardData?.jurisdiction?.id || "rdc-georgetown"}
          onClose={() => setShowRDCAnalysis(false)}
        />
      )}
    </div>
  );
};

export default RDCDashboard;
