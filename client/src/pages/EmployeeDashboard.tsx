import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, FileText, DollarSign, Calendar, CheckSquare } from "lucide-react";
import EmployeeCard from "@/components/EmployeeCard";
import TimesheetCard from "@/components/TimesheetCard";
import PaystubCard from "@/components/PaystubCard";
import LeaveBalanceCard from "@/components/LeaveBalanceCard";
import ApprovalsCard from "@/components/ApprovalsCard";

interface EmployeeSummary {
  employee: {
    id: string;
    userId: string;
    employeeId: string;
    department: string;
    position: string;
    salary: number;
    hireDate: string;
    isActive: boolean;
    jurisdictionId: string;
  };
  currentTimesheet?: {
    id: string;
    employeeId: string;
    weekEnding: string;
    totalHours: string;
    regularHours: string;
    overtimeHours: string;
    status: "draft" | "submitted" | "approved" | "rejected";
    entries: Array<{
      id: string;
      workDate: string;
      hoursWorked: string;
      overtimeHours: string;
      project?: string;
      notes?: string;
    }>;
  };
  leaveBalances: Array<{
    id: string;
    leaveType: "vacation" | "sick" | "personal" | "bereavement" | "maternity" | "paternity";
    totalAllowed: string;
    usedHours: string;
    remainingHours: string;
    carryoverHours: string;
    year: number;
  }>;
  recentPaystubs: Array<{
    id: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    payDate: string;
    grossPay: string;
    federalTax: string;
    stateTax: string;
    socialSecurity: string;
    medicare: string;
    retirement: string;
    healthcare: string;
    otherDeductions: string;
    netPay: string;
    status: "pending" | "issued" | "corrected";
  }>;
}

export default function EmployeeDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch employee summary data
  const { 
    data: summary, 
    isLoading: isSummaryLoading, 
    error: summaryError,
    refetch: refetchSummary
  } = useQuery({
    queryKey: ['/api/hr/employee/summary', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/hr/employee/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch employee summary');
      }
      return response.json() as Promise<EmployeeSummary>;
    },
  });

  // Fetch leave requests for the leave balance card
  const { 
    data: leaveRequests = [], 
    isLoading: isLeaveRequestsLoading 
  } = useQuery({
    queryKey: ['/api/hr/leave/requests', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/hr/leave/requests?limit=5');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch pending approvals (for managers/supervisors)
  const { 
    data: pendingApprovals, 
    isLoading: isApprovalsLoading 
  } = useQuery({
    queryKey: ['/api/hr/approvals', refreshKey],
    queryFn: async () => {
      const response = await fetch('/api/hr/approvals');
      if (!response.ok) return { timesheets: [], leaveRequests: [] };
      return response.json();
    },
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetchSummary();
  };

  const handleViewEmployeeDetails = (id: string) => {
    // TODO: Navigate to employee details page
    alert(`View employee details: ${id}`);
  };

  const handleEditTimesheet = (id: string) => {
    // TODO: Navigate to timesheet editor
    alert(`Edit timesheet: ${id}`);
  };

  const handleViewTimesheetDetails = (id: string) => {
    // TODO: Navigate to timesheet details
    alert(`View timesheet details: ${id}`);
  };

  const handleViewPaystubDetails = (id: string) => {
    // TODO: Navigate to paystub details
    alert(`View paystub details: ${id}`);
  };

  const handleDownloadPaystub = (id: string) => {
    // TODO: Implement paystub download
    alert(`Download paystub: ${id}`);
  };

  const handleRequestLeave = () => {
    // TODO: Open leave request form
    alert('Leave request form coming soon!');
  };

  const handleViewAllLeaveRequests = () => {
    // TODO: Navigate to leave requests page
    alert('Leave requests page coming soon!');
  };

  const handleApproveTimesheet = (id: string) => {
    // TODO: Implement approval logic
    alert(`Approve timesheet: ${id}`);
  };

  const handleDenyTimesheet = (id: string) => {
    // TODO: Implement denial logic
    alert(`Deny timesheet: ${id}`);
  };

  const handleApproveLeaveRequest = (id: string) => {
    // TODO: Implement approval logic
    alert(`Approve leave request: ${id}`);
  };

  const handleDenyLeaveRequest = (id: string) => {
    // TODO: Implement denial logic
    alert(`Deny leave request: ${id}`);
  };

  const handleViewApprovalDetails = (type: 'timesheet' | 'leave', id: string) => {
    // TODO: Navigate to details page
    alert(`View ${type} details: ${id}`);
  };

  if (summaryError) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load employee dashboard. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee Dashboard</h1>
              <p className="text-muted-foreground">
                {summary?.employee ? `Welcome back, ${summary.employee.position}` : "Loading..."}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isSummaryLoading}
              data-testid="button-refresh-dashboard"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSummaryLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Employee Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <User className="h-4 w-4" />
              Employee Information
            </div>
            
            {isSummaryLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : summary?.employee ? (
              <EmployeeCard
                id={summary.employee.id}
                fullName="John Doe" // TODO: Get from user data
                position={summary.employee.position}
                department={summary.employee.department}
                email="john.doe@city.gov" // TODO: Get from user data
                hireDate={summary.employee.hireDate}
                salary={summary.employee.salary}
                isActive={summary.employee.isActive}
                onViewDetails={handleViewEmployeeDetails}
              />
            ) : null}

            {/* Current Timesheet */}
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <FileText className="h-4 w-4" />
              Current Timesheet
            </div>
            
            {isSummaryLoading ? (
              <Skeleton className="h-80 w-full rounded-lg" />
            ) : summary?.currentTimesheet ? (
              <TimesheetCard
                id={summary.currentTimesheet.id}
                weekEnding={summary.currentTimesheet.weekEnding}
                totalHours={parseFloat(summary.currentTimesheet.totalHours)}
                regularHours={parseFloat(summary.currentTimesheet.regularHours)}
                overtimeHours={parseFloat(summary.currentTimesheet.overtimeHours)}
                status={summary.currentTimesheet.status}
                employeeName="John Doe" // TODO: Get from user data
                entries={summary.currentTimesheet.entries.map(entry => ({
                  date: entry.workDate,
                  hoursWorked: parseFloat(entry.hoursWorked),
                  overtimeHours: parseFloat(entry.overtimeHours),
                  project: entry.project,
                  notes: entry.notes,
                }))}
                onEdit={handleEditTimesheet}
                onView={handleViewTimesheetDetails}
                isEditable={summary.currentTimesheet.status === 'draft'}
              />
            ) : (
              <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No current timesheet</p>
              </div>
            )}
          </div>

          {/* Payroll and Leave */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <DollarSign className="h-4 w-4" />
              Recent Paystub
            </div>
            
            {isSummaryLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : summary?.recentPaystubs?.[0] ? (
              <PaystubCard
                {...summary.recentPaystubs[0]}
                onView={handleViewPaystubDetails}
                onDownload={handleDownloadPaystub}
              />
            ) : (
              <div className="p-6 text-center text-muted-foreground bg-muted/30 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent paystubs</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Calendar className="h-4 w-4" />
              Leave Balances
            </div>
            
            {isSummaryLoading || isLeaveRequestsLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <LeaveBalanceCard
                balances={summary?.leaveBalances || []}
                recentRequests={leaveRequests}
                onRequestLeave={handleRequestLeave}
                onViewAllRequests={handleViewAllLeaveRequests}
              />
            )}
          </div>

          {/* Approvals (if applicable) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <CheckSquare className="h-4 w-4" />
              Pending Approvals
            </div>
            
            {isApprovalsLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <ApprovalsCard
                pendingTimesheets={pendingApprovals?.timesheets || []}
                pendingLeaveRequests={pendingApprovals?.leaveRequests || []}
                onApproveTimesheet={handleApproveTimesheet}
                onDenyTimesheet={handleDenyTimesheet}
                onApproveLeaveRequest={handleApproveLeaveRequest}
                onDenyLeaveRequest={handleDenyLeaveRequest}
                onViewDetails={handleViewApprovalDetails}
                isLoading={isApprovalsLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}