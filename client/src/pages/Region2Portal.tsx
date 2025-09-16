import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, MapPin, AlertCircle, CheckCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import ServiceCard from '../components/ServiceCard';
import DashboardWidget from '../components/DashboardWidget';
import ProjectTable from '../components/ProjectTable';
import FeedbackForm from '../components/FeedbackForm';

// Types for our API
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'approved' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  progressPercentage: number;
  category: string;
  priority: string;
  scope: string;
  fundingSource: string;
  budgetAllocated: number;
  budgetSpent: number;
  currency: string;
  plannedStartDate: string;
  plannedEndDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API function to fetch projects for Region 2
const fetchRegion2Projects = async (): Promise<ProjectListResponse> => {
  const response = await fetch('/api/projects?jurisdictionId=region-2');
  if (!response.ok) throw new Error('Failed to fetch projects');
  return response.json();
};

const Region2Portal = () => {
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState<'resident' | 'farmer' | 'business'>('resident');
  const [showAllServices, setShowAllServices] = useState(false);

  // Fetch projects for Region 2
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects', 'region-2'],
    queryFn: fetchRegion2Projects,
  });

  const servicesByUser = {
    resident: ['Issue Reporting', 'Road Issues', 'Document Request', 'Community Programs'],
    farmer: ['Issue Reporting', 'Road Issues', 'Agri Grants', 'Land Use Permit', 'Drainage Issues'],
    business: ['Issue Reporting', 'Road Issues', 'Business License', 'Building Permit'],
  };

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

  const renderServices = () => {
    return servicesByUser[userType].map((service, index) => (
      <ServiceCard key={index} title={service} />
    ));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="border-b mb-6" style={{ backgroundColor: '#009739' }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToHome} className="bg-white text-green-700 border-white hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">🇬🇾 Region 2: Pomeroon-Supenaam</h1>
                <p className="text-sm text-green-100">Regional Democratic Council Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+592 777-1235</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@region2.gov.gy</span>
              </div>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as any)}
                className="border px-3 py-2 rounded text-black border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                style={{ backgroundColor: '#FFD100' }}
              >
                <option value="resident">Resident</option>
                <option value="farmer">Farmer</option>
                <option value="business">Business Owner</option>
              </select>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Smart Routing Panel */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Services for {userType}</h2>
        <div className="container mx-auto px-6">
          <div className={`grid gap-4 ${
            userType === 'resident' ? 'grid-cols-2 md:grid-cols-4' :
            userType === 'farmer' ? 'grid-cols-2 md:grid-cols-5' :
            'grid-cols-2 md:grid-cols-4'
          }`}>{renderServices()}</div>
        </div>
      </section>

      {/* Main Content - 3 Column Layout */}
      <div className="container mx-auto px-6">
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
                <span className="font-semibold">46</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="font-semibold text-green-600">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Complaints Resolved</span>
                <span className="font-semibold text-green-600">91%</span>
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
                <p className="text-sm text-muted-foreground">Regional Democratic Council, Anna Regina, Region 2</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Office Hours</p>
                <p className="text-sm text-muted-foreground">Monday - Friday: 8:00 AM - 4:30 PM</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Emergency Contact</p>
                <p className="text-sm text-muted-foreground">+592 777-1235 (24/7)</p>
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
              <p className="text-sm text-muted-foreground mb-4">Coastal region managing Anna Regina and surrounding areas, specializing in rice farming and coastal development.</p>
              
              <div className="space-y-3">
                <h4 className="font-medium">Key Services</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Rice farming support programs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Coastal development projects
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Water management systems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Agricultural training programs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Community development initiatives
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Anna Regina Road Repairs</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">in progress</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Water Tank Installation</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Available Services */}
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
                <h4 className="font-medium text-sm mb-1">Road Issues</h4>
                <p className="text-xs text-muted-foreground">Report and track road maintenance and repair requests</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">Document Request</h4>
                <p className="text-xs text-muted-foreground">Get certified copies and official documents</p>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">Community Programs</h4>
                <p className="text-xs text-muted-foreground">Access agricultural and development programs</p>
              </div>
              
              {showAllServices && (
                <>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Agri Grants</h4>
                    <p className="text-xs text-muted-foreground">Apply for agricultural grants and funding programs</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Land Use Permit</h4>
                    <p className="text-xs text-muted-foreground">Apply for land use and development permits</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Drainage Issues</h4>
                    <p className="text-xs text-muted-foreground">Report drainage and water management problems</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Business License</h4>
                    <p className="text-xs text-muted-foreground">Apply for business registration and licensing</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Building Permit</h4>
                    <p className="text-xs text-muted-foreground">Apply for construction and building permits</p>
                  </div>
                </>
              )}
              
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
              >
                {showAllServices ? 'Show Less' : 'Read More...'}
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span>📄</span>
                <span className="ml-2">Download Forms</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span>🏢</span>
                <span className="ml-2">RDC Directory</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span>🕐</span>
                <span className="ml-2">Meeting Schedule</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <span>👥</span>
                <span className="ml-2">Contact Representatives</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-lg bg-card animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : projectsError ? (
                <div className="text-center text-red-500 py-4">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Failed to load projects</p>
                </div>
              ) : projectsData?.projects && projectsData.projects.length > 0 ? (
                <ProjectTable projects={projectsData.projects} />
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p>No active projects found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>


      {/* Feedback & Support */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Feedback & Support</h2>
        <FeedbackForm />
      </section>
    </div>
  );
};

export default Region2Portal;
