import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useLocation } from "wouter";

// Types
interface RDCStats {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  issueStats: {
    total: number;
    submitted: number;
    inProgress: number;
    resolved: number;
    urgent: number;
  };
  announcementCount: number;
  lastUpdated: string;
}

interface OverallStats {
  totalRDCs: number;
  totalIssues: number;
  urgentIssues: number;
  resolvedIssues: number;
  totalAnnouncements: number;
  averageResolutionRate: string;
}

interface MinisterialDashboardData {
  overallStats: OverallStats;
  rdcStats: RDCStats[];
  lastUpdated: string;
}

// API function
const fetchMinisterialDashboard = async (): Promise<MinisterialDashboardData> => {
  const response = await fetch('/api/ministerial/dashboard');
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Ministerial access required');
    }
    throw new Error('Failed to fetch ministerial dashboard data');
  }
  return response.json();
};

export default function MinisterialDashboard() {
  const [, setLocation] = useLocation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['ministerial-dashboard'],
    queryFn: fetchMinisterialDashboard,
    retry: false,
  });

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">🇬🇾 Ministerial Dashboard</h1>
                <p className="text-sm text-muted-foreground">Regional Democratic Councils Overview</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">🇬🇾 Ministerial Dashboard</h1>
                <p className="text-sm text-muted-foreground">Regional Democratic Councils Overview</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                {error.message === 'Ministerial access required' 
                  ? 'You need ministerial-level access to view this dashboard.'
                  : 'Failed to load dashboard data. Please try again.'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
                <Button variant="outline" onClick={handleBackToHome}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overallStats, rdcStats } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">🇬🇾 Ministerial Dashboard</h1>
              <p className="text-sm text-muted-foreground">Regional Democratic Councils Overview</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total RDCs</p>
                  <p className="text-2xl font-bold">{overallStats.totalRDCs}</p>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{overallStats.totalIssues}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent Issues</p>
                  <p className="text-2xl font-bold text-destructive">{overallStats.urgentIssues}</p>
                </div>
                <Clock className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolution Rate</p>
                  <p className="text-2xl font-bold text-primary">{overallStats.averageResolutionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RDC Statistics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {rdcStats.map((rdc) => (
            <Card key={rdc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{rdc.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{rdc.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {rdc.issueStats.total} issues
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Issue Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{rdc.issueStats.resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{rdc.issueStats.urgent}</p>
                      <p className="text-xs text-muted-foreground">Urgent</p>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span>{rdc.issueStats.submitted}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">In Progress:</span>
                      <span>{rdc.issueStats.inProgress}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Announcements:</span>
                      <span>{rdc.announcementCount}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="pt-3 border-t">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>Phone:</strong> {rdc.contactPhone}</p>
                      <p><strong>Email:</strong> {rdc.contactEmail}</p>
                      <p><strong>Address:</strong> {rdc.address}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setLocation(`/rdc/${rdc.id}`)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View RDC Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
