import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Search, Plus, AlertCircle, Users, MapPin, LogOut } from "lucide-react";
import JurisdictionCard from "@/components/JurisdictionCard";
import StatsCard from "@/components/StatsCard";
import AnnouncementCard from "@/components/AnnouncementCard";

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
const fetchJurisdictions = async (): Promise<Jurisdiction[]> => {
  const response = await fetch('/api/jurisdictions');
  if (!response.ok) throw new Error('Failed to fetch jurisdictions');
  return response.json();
};

const fetchAnnouncements = async (jurisdictionId: string): Promise<Announcement[]> => {
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/announcements`);
  if (!response.ok) throw new Error('Failed to fetch announcements');
  return response.json();
};

const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
};

const logoutUser = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', { method: 'POST' });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Check authentication
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  });

  // Fetch jurisdictions from API
  const { data: jurisdictions = [], isLoading: jurisdictionsLoading, error: jurisdictionsError } = useQuery({
    queryKey: ['jurisdictions'],
    queryFn: fetchJurisdictions,
  });

  // Fetch announcements from the first jurisdiction (for demo)
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', jurisdictions[0]?.id],
    queryFn: () => fetchAnnouncements(jurisdictions[0]?.id),
    enabled: !!jurisdictions[0]?.id,
  });

  const handleJurisdictionSelect = (id: string) => {
    // TODO: Implement navigation to jurisdiction portal
    window.location.href = `/jurisdiction/${id}`;
  };

  const handleQuickReport = () => {
    // TODO: Implement quick report modal
    alert('Quick report feature coming soon!');
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const filteredJurisdictions = jurisdictions.filter((jurisdiction) =>
    jurisdiction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    jurisdiction.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Local Government Portal</h1>
                <p className="text-sm text-muted-foreground">Citizen Services & Administrative Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {authData?.user && (
                <div className="text-right">
                  <p className="text-sm font-medium">Welcome, {authData.user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{authData.user.role}</p>
                </div>
              )}
              <Button onClick={handleQuickReport} data-testid="button-quick-report">
                <Plus className="h-4 w-4 mr-2" />
                Quick Report
              </Button>
              {authData?.user ? (
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button variant="outline" onClick={() => window.location.href = '/login'}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Issues"
            value={46}
            description="Across all jurisdictions"
            icon={AlertCircle}
            trend={{ value: 12, isPositive: false }}
          />
          <StatsCard
            title="Active Jurisdictions"
            value={3}
            description="Local governments"
            icon={Building}
          />
          <StatsCard
            title="Citizens Served"
            value="12.5K"
            description="Registered users"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Service Areas"
            value={15}
            description="Coverage zones"
            icon={MapPin}
          />
        </div>

        {/* Search and Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Your Local Government</CardTitle>
            <p className="text-sm text-muted-foreground">
              Search for your jurisdiction to report issues, track service requests, and access local services.
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by jurisdiction name or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-jurisdictions"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jurisdictions List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Local Jurisdictions</h2>
              <span className="text-sm text-muted-foreground">
                {filteredJurisdictions.length} of {jurisdictions.length} jurisdictions
              </span>
            </div>
            
            <div className="space-y-4">
              {jurisdictionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jurisdictionsError ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error loading jurisdictions</h3>
                    <p className="text-muted-foreground">
                      Please try refreshing the page.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredJurisdictions.map((jurisdiction) => (
                    <JurisdictionCard
                      key={jurisdiction.id}
                      {...jurisdiction}
                      onSelect={handleJurisdictionSelect}
                    />
                  ))}
                  
                  {filteredJurisdictions.length === 0 && (
                    <Card className="text-center py-8">
                      <CardContent>
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No jurisdictions found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search terms or browse all available jurisdictions.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Announcements Sidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Latest Announcements</h2>
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
                <Button className="w-full justify-start" data-testid="button-report-issue">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
                <Button variant="secondary" className="w-full justify-start" data-testid="button-track-request">
                  <Search className="h-4 w-4 mr-2" />
                  Track Service Request
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-contact-support">
                  <Users className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}