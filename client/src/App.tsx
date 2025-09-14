import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import HomePage from "@/pages/HomePage";
import JurisdictionPortal from "@/pages/JurisdictionPortal";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import EmployeeDirectory from "@/pages/EmployeeDirectory";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/jurisdiction/:id" component={JurisdictionPortal} />
      <Route path="/staff/dashboard" component={EmployeeDashboard} />
      <Route path="/staff/directory" component={EmployeeDirectory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
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
  );
}

export default App;
