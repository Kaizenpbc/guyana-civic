import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Search, Plus, AlertCircle, Users, MapPin } from "lucide-react";
import JurisdictionCard from "@/components/JurisdictionCard";
import StatsCard from "@/components/StatsCard";
import AnnouncementCard from "@/components/AnnouncementCard";

//todo: remove mock functionality
const mockJurisdictions = [
  {
    id: "metro-central",
    name: "Metro Central District",
    description: "Central business district managing commercial zones, transportation infrastructure, and downtown public services.",
    contactEmail: "info@metrocentral.gov",
    contactPhone: "+1 (555) 123-4567",
    address: "100 City Hall Plaza, Metro Central",
    issueCount: 23,
  },
  {
    id: "riverside-municipal",
    name: "Riverside Municipal Council",
    description: "Residential area council responsible for parks, community centers, and local road maintenance.",
    contactEmail: "contact@riverside.municipal.gov",
    contactPhone: "+1 (555) 987-6543",
    address: "45 Riverside Community Center, Riverside",
    issueCount: 8,
  },
  {
    id: "northside-township",
    name: "Northside Township",
    description: "Industrial and residential mixed-use area managing utilities, waste services, and community development.",
    contactEmail: "admin@northside.township.gov",
    contactPhone: "+1 (555) 456-7890",
    address: "200 Industrial Blvd, Northside",
    issueCount: 15,
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
  {
    id: "ann-2",
    title: "Community Meeting - February Budget Planning",
    content: "Join us for the annual budget planning meeting on February 15th at 7 PM in the Community Center.",
    authorName: "Mayor Sarah Wilson",
    createdAt: "2024-01-18",
    isActive: true,
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleJurisdictionSelect = (id: string) => {
    console.log('Navigate to jurisdiction:', id);
  };

  const handleQuickReport = () => {
    console.log('Open quick report modal');
  };

  const filteredJurisdictions = mockJurisdictions.filter(jurisdiction =>
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
            <Button onClick={handleQuickReport} data-testid="button-quick-report">
              <Plus className="h-4 w-4 mr-2" />
              Quick Report
            </Button>
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
                {filteredJurisdictions.length} of {mockJurisdictions.length} jurisdictions
              </span>
            </div>
            
            <div className="space-y-4">
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
            </div>
          </div>

          {/* Announcements Sidebar */}
          <div>
            <h2 className="text-xl font-semibold mb-6">Latest Announcements</h2>
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
                <Button variant="outline" className="w-full justify-start" data-testid="button-report-issue">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report an Issue
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-track-request">
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