import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import HomePage from "@/pages/HomePage";
import JurisdictionPortal from "@/pages/JurisdictionPortal";
import RDCPortal from "@/pages/RDCPortal";
import Region2Portal from "@/pages/Region2Portal";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import LoginPage from "@/pages/LoginPage";
import StaffDashboard from "@/pages/StaffDashboard";
import PMDashboard from "@/pages/PMDashboard";
import RDCDashboard from "@/pages/RDCDashboard";
import MinisterialDashboard from "@/pages/MinisterialDashboard";
import ProjectPage from "@/pages/ProjectPage";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import React from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/rdc/region-2" component={Region2Portal} />
      <Route path="/rdc/:id" component={RDCPortal} />
      <Route path="/jurisdiction/:id" component={JurisdictionPortal} />
      <Route path="/staff/dashboard" component={StaffDashboard} />
      <Route path="/staff/directory" component={EmployeeDirectory} />
      <Route path="/pm/dashboard" component={PMDashboard} />
      <Route path="/rdc/dashboard" component={RDCDashboard} />
      <Route path="/admin/dashboard" component={StaffDashboard} />
      <Route path="/ministerial/dashboard" component={MinisterialDashboard} />
      <Route path="/project/:id" component={({ params }: { params: { id: string } }) => <ProjectPage projectId={params.id} />} />
      <Route path="/unauthorized" component={Unauthorized} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="gov-portal-theme">
          <TooltipProvider>
            <div className="relative">
              {/* Global Theme Toggle */}
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
