import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Search, AlertCircle, Users } from "lucide-react";
import JurisdictionCard from "@/components/JurisdictionCard";

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


// API functions
const fetchJurisdictions = async (): Promise<Jurisdiction[]> => {
  const response = await fetch('/api/jurisdictions');
  if (!response.ok) throw new Error('Failed to fetch jurisdictions');
  return response.json();
};


const getCurrentUser = async (): Promise<{ user: any }> => {
  const response = await fetch('/api/auth/me');
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  return response.json();
};


export default function HomePage() {
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


  const handleJurisdictionSelect = (id: string) => {
    // Navigate to RDC-specific portal
    window.location.href = `/rdc/${id}`;
  };


  const filteredJurisdictions = jurisdictions;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">🇬🇾 Regional Democratic Councils</h1>
                <p className="text-sm text-muted-foreground">Citizen Services & Administrative Management</p>
                {/* Updated: Removed What You Can Do section - will be on RDC pages */}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {authData?.user && (
                <div className="text-right">
                  <p className="text-sm font-medium">Welcome, {authData.user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{authData.user.role}</p>
                  {authData.user.role === 'super_admin' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.location.href = '/ministerial/dashboard'}
                    >
                      <Building className="h-3 w-3 mr-1" />
                      Ministerial Dashboard
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* What You Can Do */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">What You Can Do</h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                After selecting your RDC, you can:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Report Issues</p>
                    <p className="text-sm text-muted-foreground">Report road problems, utilities, or other local issues</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Track Requests</p>
                    <p className="text-sm text-muted-foreground">Monitor the status of your service requests</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Contact Your RDC</p>
                    <p className="text-sm text-muted-foreground">Get in touch with local representatives</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RDC Selection Header */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Choose Your Regional Democratic Council</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select your region to access local services, report issues, and connect with your RDC representatives.
            </p>
          </CardHeader>
        </Card>

        {/* RDC Selection Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Select Your RDC</h2>
            <span className="text-sm text-muted-foreground">
              {jurisdictions.length} regions available
            </span>
          </div>
          
          {jurisdictionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {filteredJurisdictions.map((jurisdiction) => (
                <JurisdictionCard
                  key={jurisdiction.id}
                  {...jurisdiction}
                  onSelect={handleJurisdictionSelect}
                />
              ))}
              
            </div>
          )}
        </div>


      </div>
    </div>
  );
}