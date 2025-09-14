import { useState } from "react";
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

//todo: remove mock functionality
const mockJurisdiction = {
  id: "metro-central",
  name: "Metro Central District",
  description: "Central business district managing commercial zones, transportation infrastructure, and downtown public services.",
  contactEmail: "info@metrocentral.gov",
  contactPhone: "+1 (555) 123-4567",
  address: "100 City Hall Plaza, Metro Central",
};

//todo: remove mock functionality
const mockIssues = [
  {
    id: "issue-1",
    title: "Pothole on Main Street causing traffic delays",
    description: "Large pothole near the intersection of Main Street and Oak Avenue is causing significant traffic delays and potential vehicle damage.",
    category: "roads",
    priority: "high" as const,
    status: "in_progress" as const,
    location: "Main Street & Oak Avenue",
    citizenName: "Sarah Johnson",
    createdAt: "2024-01-15",
  },
  {
    id: "issue-2",
    title: "Street light outage in residential area",
    description: "Multiple street lights are out on Elm Street, creating safety concerns for evening pedestrians.",
    category: "lighting",
    priority: "medium" as const,
    status: "acknowledged" as const,
    location: "Elm Street (100-200 block)",
    citizenName: "Michael Chen",
    createdAt: "2024-01-12",
  },
  {
    id: "issue-3",
    title: "Drainage system backup after heavy rain",
    description: "Storm drain near the community center is backing up during heavy rain, causing flooding.",
    category: "drainage",
    priority: "urgent" as const,
    status: "submitted" as const,
    location: "Community Center Parking Area",
    citizenName: "Amanda Rodriguez",
    createdAt: "2024-01-18",
  },
];

//todo: remove mock functionality
const mockAnnouncements = [
  {
    id: "ann-1",
    title: "Road Maintenance Schedule - Main Street",
    content: "Main Street will undergo scheduled maintenance from January 25-27. Traffic will be diverted through Oak Avenue during construction hours.",
    authorName: "City Works Department",
    createdAt: "2024-01-20",
    isActive: true,
  },
];

export default function JurisdictionPortal() {
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleBack = () => {
    console.log('Navigate back to home');
  };

  const handleViewIssue = (id: string) => {
    console.log('View issue details:', id);
  };

  const handleSubmitIssue = (issueData: any) => {
    console.log('Submit new issue:', issueData);
    setShowReportForm(false);
  };

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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
          <IssueReportForm onSubmit={handleSubmitIssue} onCancel={() => setShowReportForm(false)} />
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
                <h1 className="text-2xl font-bold text-foreground">{mockJurisdiction.name}</h1>
                <p className="text-sm text-muted-foreground">{mockJurisdiction.description}</p>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{mockJurisdiction.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{mockJurisdiction.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{mockJurisdiction.contactEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Issues"
            value={23}
            description="All time reports"
            icon={AlertCircle}
          />
          <StatsCard
            title="Resolved Issues"
            value={19}
            description="Successfully completed"
            icon={CheckCircle}
          />
          <StatsCard
            title="In Progress"
            value={4}
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
                {filteredIssues.length} of {mockIssues.length} issues
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
              {filteredIssues.map((issue) => (
                <IssueCard key={issue.id} {...issue} onView={handleViewIssue} />
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
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Announcements</h2>
            <div className="space-y-4">
              {mockAnnouncements.map((announcement) => (
                <AnnouncementCard key={announcement.id} {...announcement} />
              ))}
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