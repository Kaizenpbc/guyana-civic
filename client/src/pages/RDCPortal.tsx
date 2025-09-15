import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  AlertTriangle,
  FileText,
  Users,
  Building,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import FeedbackForm from "@/components/FeedbackForm";

// Types
interface Jurisdiction {
  id: string;
  name: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  createdAt: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  isActive: boolean;
}

// API functions
const fetchJurisdiction = async (id: string): Promise<Jurisdiction> => {
  const response = await fetch(`/api/jurisdictions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch jurisdiction');
  return response.json();
};

const fetchIssues = async (jurisdictionId: string): Promise<Issue[]> => {
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/issues`);
  if (!response.ok) throw new Error('Failed to fetch issues');
  return response.json();
};

const fetchAnnouncements = async (jurisdictionId: string): Promise<Announcement[]> => {
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/announcements`);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

interface RDCPortalProps {
  params: { id: string };
}

export default function RDCPortal({ params }: RDCPortalProps) {
  const [, setLocation] = useLocation();
  const { id } = params;

  // Fetch RDC data
  const { data: jurisdiction, isLoading: jurisdictionLoading } = useQuery({
    queryKey: ['jurisdiction', id],
    queryFn: () => fetchJurisdiction(id),
    enabled: !!id,
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['issues', id],
    queryFn: () => fetchIssues(id),
    enabled: !!id,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', id],
    queryFn: () => fetchAnnouncements(id),
    enabled: !!id,
  });

  const handleBackToHome = () => {
    setLocation('/');
  };

  const handleReportIssue = () => {
    // TODO: Implement report issue modal
    alert('Report issue feature coming soon!');
  };

  const handleTrackRequests = () => {
    // TODO: Implement track requests page
    alert('Track requests feature coming soon!');
  };

  const handleContactRDC = () => {
    // TODO: Implement contact form
    alert('Contact form coming soon!');
  };

  const handleViewAnnouncements = () => {
    // TODO: Implement announcements page
    alert('Announcements page coming soon!');
  };

  if (jurisdictionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading RDC information...</p>
        </div>
      </div>
    );
  }

  if (!jurisdiction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">RDC Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested Regional Democratic Council could not be found.</p>
          <Button onClick={handleBackToHome}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
  const urgentIssues = issues.filter(issue => issue.priority === 'urgent').length;
  const recentIssues = issues.slice(0, 3);
  const recentAnnouncements = announcements.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#009739' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToHome} className="bg-white text-green-700 border-white hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">🇬🇾 {jurisdiction.name}</h1>
                <p className="text-sm text-green-100">Regional Democratic Council Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{jurisdiction.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{jurisdiction.contactEmail}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={handleReportIssue}
            className="h-16 flex flex-col items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#FFD100' }}
            size="lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Report Issue</span>
            </div>
            <span className="text-xs opacity-90">Click to access</span>
          </Button>
          <Button 
            onClick={handleTrackRequests}
            className="h-16 flex flex-col items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#EF3340' }}
            size="lg"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Track Requests</span>
            </div>
            <span className="text-xs opacity-90">Click to access</span>
          </Button>
          <Button 
            onClick={handleContactRDC}
            className="h-16 flex flex-col items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#000000' }}
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              <span>Contact RDC</span>
            </div>
            <span className="text-xs opacity-90">Click to access</span>
          </Button>
          <Button 
            onClick={handleViewAnnouncements}
            className="h-16 flex flex-col items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#009739' }}
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <span>View Announcements</span>
            </div>
            <span className="text-xs opacity-90">Click to access</span>
          </Button>
        </div>

        {/* Main Content - 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Local Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Local Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Issues</span>
                  <span className="font-semibold">{totalIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Resolved</span>
                  <span className="font-semibold text-green-600">{resolvedIssues}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Complaints Resolved</span>
                  <span className="font-semibold text-green-600">
                    {totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0}%
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Regional Budget</span>
                  <span className="font-semibold">GY$4.2B</span>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-semibold mb-2">Sector Breakdown</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Roads:</span>
                      <span>GY$1.2B</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Water:</span>
                      <span>GY$800M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Agriculture:</span>
                      <span>GY$1.5B</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Office Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Address</p>
                  <p className="text-sm text-muted-foreground">{jurisdiction.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Office Hours</p>
                  <p className="text-sm text-muted-foreground">Monday - Friday: 8:00 AM - 4:30 PM</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Emergency Contact</p>
                  <p className="text-sm text-muted-foreground">+592 777-1234 (24/7)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - RDC Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">RDC Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{jurisdiction.description}</p>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Key Services</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Road maintenance and repairs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Water and sanitation services
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Agricultural support programs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Community development projects
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Border services and customs
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentIssues.length > 0 ? (
                  <div className="space-y-3">
                    {recentIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                          {issue.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent issues</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Services & Resources */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Available Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Issue Reporting</h4>
                  <p className="text-xs text-muted-foreground">Report road problems, utilities, or other local issues</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Permit Applications</h4>
                  <p className="text-xs text-muted-foreground">Apply for building permits and business licenses</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Community Programs</h4>
                  <p className="text-xs text-muted-foreground">Access agricultural and development programs</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm mb-1">Document Services</h4>
                  <p className="text-xs text-muted-foreground">Get certified copies and official documents</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Forms
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Building className="h-4 w-4 mr-2" />
                  RDC Directory
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Meeting Schedule
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Contact Representatives
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{announcement.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback & Support */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Feedback & Support</h2>
          <FeedbackForm />
        </section>
      </div>
    </div>
  );
}
