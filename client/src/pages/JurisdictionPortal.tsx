import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Plus, Building, Phone, Mail, MapPin } from "lucide-react";
import IssueCard from "@/components/IssueCard";
import IssueReportForm from "@/components/IssueReportForm";
import StatsCard from "@/components/StatsCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

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
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "acknowledged" | "in_progress" | "resolved" | "closed";
  location: string;
  citizenId: string;
  jurisdictionId: string;
  assignedToId?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  jurisdictionId: string;
  authorId: string;
  isActive: boolean;
  createdAt: string;
}

// API functions
const fetchJurisdiction = async (id: string): Promise<Jurisdiction> => {
  const response = await fetch(`/api/jurisdictions/${id}`);
  if (!response.ok) throw new Error('Failed to fetch jurisdiction');
  return response.json();
};

const fetchIssues = async (jurisdictionId: string, filters?: { status?: string; category?: string }): Promise<Issue[]> => {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== "all") params.append('status', filters.status);
  if (filters?.category && filters.category !== "all") params.append('category', filters.category);
  
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/issues?${params}`);
  if (!response.ok) throw new Error('Failed to fetch issues');
  return response.json();
};

const fetchAnnouncements = async (jurisdictionId: string): Promise<Announcement[]> => {
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/announcements`);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

export default function JurisdictionPortal() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Get jurisdiction ID from URL (for now, default to metro-central)
  const jurisdictionId = "metro-central"; // TODO: Get from URL params
  
  // Fetch jurisdiction data
  const { data: jurisdiction, isLoading: jurisdictionLoading, error: jurisdictionError } = useQuery({
    queryKey: ['jurisdiction', jurisdictionId],
    queryFn: () => fetchJurisdiction(jurisdictionId),
  });

  // Fetch issues with filters
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: ['issues', jurisdictionId, statusFilter, categoryFilter],
    queryFn: () => fetchIssues(jurisdictionId, { status: statusFilter, category: categoryFilter }),
    enabled: !!jurisdictionId,
  });

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', jurisdictionId],
    queryFn: () => fetchAnnouncements(jurisdictionId),
    enabled: !!jurisdictionId,
  });

  const handleBack = () => {
    window.location.href = '/';
  };

  const handleViewIssue = (id: string) => {
    // TODO: Implement issue details modal/page
    alert(`View issue details for: ${id}`);
  };

  const handleSubmitIssue = (issueData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    location: string;
  }) => {
    // TODO: Implement issue submission to API
    alert('Issue submitted successfully!');
    setShowReportForm(false);
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (showReportForm) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <Button variant="ghost" onClick={() => setShowReportForm(false)} className="mb-4" data-testid="button-back-to-portal">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8">
          <IssueReportForm 
            jurisdictionId={jurisdictionId}
            onSubmit={handleSubmitIssue} 
            onCancel={() => setShowReportForm(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={handleBack} className="mb-4" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                {jurisdictionLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded w-64 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-96"></div>
                  </div>
                ) : jurisdictionError ? (
                  <div>
                    <h1 className="text-2xl font-bold text-destructive">Error loading jurisdiction</h1>
                    <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                  </div>
                ) : jurisdiction ? (
                  <>
                    <h1 className="text-2xl font-bold text-foreground">{jurisdiction.name}</h1>
                    <p className="text-sm text-muted-foreground">{jurisdiction.description}</p>
                  </>
                ) : null}
              </div>
            </div>
            <Button onClick={() => setShowReportForm(true)} data-testid="button-report-issue">
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Contact Info Card */}
        {jurisdiction && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{jurisdiction.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{jurisdiction.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{jurisdiction.contactEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Issues"
            value={issues.length}
            description="All time reports"
            icon={AlertCircle}
          />
          <StatsCard
            title="Resolved Issues"
            value={issues.filter(issue => issue.status === "resolved").length}
            description="Successfully completed"
            icon={CheckCircle}
          />
          <StatsCard
            title="In Progress"
            value={issues.filter(issue => issue.status === "in_progress").length}
            description="Currently being addressed"
            icon={Clock}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Service Requests</h2>
              <Badge variant="outline">
                {filteredIssues.length} of {issues.length} issues
              </Badge>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-issues"
                      />
                    </div>
                  </div>
                  
                  <Select onValueChange={setStatusFilter} defaultValue="all">
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select onValueChange={setCategoryFilter} defaultValue="all">
                    <SelectTrigger className="w-full md:w-48" data-testid="select-category-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="roads">Roads</SelectItem>
                      <SelectItem value="lighting">Lighting</SelectItem>
                      <SelectItem value="drainage">Drainage</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="waste">Waste</SelectItem>
                      <SelectItem value="parks">Parks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Issues */}
            <div className="space-y-4">
              {issuesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-muted rounded w-full"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : issuesError ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading issues</h3>
                    <p className="text-muted-foreground">
                      Please try refreshing the page.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredIssues.map((issue) => (
                    <IssueCard 
                      key={issue.id} 
                      id={issue.id}
                      title={issue.title}
                      description={issue.description}
                      category={issue.category}
                      priority={issue.priority}
                      status={issue.status}
                      location={issue.location}
                      citizenName="Citizen" // TODO: Get from user data
                      createdAt={issue.createdAt}
                      onView={handleViewIssue} 
                    />
                  ))}
                  
                  {filteredIssues.length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No issues found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search or filter criteria.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <AnnouncementCard 
                  key={announcement.id} 
                  id={announcement.id}
                  title={announcement.title}
                  content={announcement.content}
                  authorName="City Works Department" // TODO: Get from user data
                  createdAt={announcement.createdAt}
                  isActive={announcement.isActive}
                />
              ))}
              {announcements.length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <p className="text-muted-foreground">No announcements available</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setShowReportForm(true)}
                  data-testid="button-quick-report"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Report New Issue
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-emergency-contact">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Contact
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-service-status">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Service Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}