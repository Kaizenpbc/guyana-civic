import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, User, CheckCircle, XCircle, Eye, Calendar } from "lucide-react";

interface PendingTimesheet {
  id: string;
  employeeId: string;
  weekEnding: string;
  totalHours: string;
  regularHours: string;
  overtimeHours: string;
  status: "submitted";
  submittedAt: string;
  employee?: {
    fullName: string;
    position: string;
    avatarUrl?: string;
  };
}

interface PendingLeaveRequest {
  id: string;
  employeeId: string;
  leaveType: "vacation" | "sick" | "personal" | "bereavement" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  hoursRequested: string;
  reason?: string;
  status: "pending";
  createdAt: string;
  employee?: {
    fullName: string;
    position: string;
    avatarUrl?: string;
  };
}

interface ApprovalsCardProps {
  pendingTimesheets: PendingTimesheet[];
  pendingLeaveRequests: PendingLeaveRequest[];
  onApproveTimesheet: (id: string) => void;
  onDenyTimesheet: (id: string) => void;
  onApproveLeaveRequest: (id: string) => void;
  onDenyLeaveRequest: (id: string) => void;
  onViewDetails: (type: 'timesheet' | 'leave', id: string) => void;
  isLoading?: boolean;
}

const leaveTypeLabels = {
  vacation: "Vacation",
  sick: "Sick Leave",
  personal: "Personal",
  bereavement: "Bereavement",
  maternity: "Maternity",
  paternity: "Paternity",
};

export default function ApprovalsCard({
  pendingTimesheets,
  pendingLeaveRequests,
  onApproveTimesheet,
  onDenyTimesheet,
  onApproveLeaveRequest,
  onDenyLeaveRequest,
  onViewDetails,
  isLoading = false,
}: ApprovalsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPending = pendingTimesheets.length + pendingLeaveRequests.length;

  if (isLoading) {
    return (
      <Card data-testid="card-approvals">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">Loading approvals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate" data-testid="card-approvals">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
        {totalPending > 0 && (
          <Badge variant="destructive" data-testid="badge-pending-count">
            {totalPending} pending
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        {totalPending === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending approvals</p>
            <p className="text-xs text-muted-foreground">All items have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Timesheets */}
            {pendingTimesheets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Timesheet Approvals ({pendingTimesheets.length})
                </h4>
                {pendingTimesheets.map((timesheet) => (
                  <div 
                    key={timesheet.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    data-testid={`timesheet-approval-${timesheet.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={timesheet.employee?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {timesheet.employee ? getInitials(timesheet.employee.fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {timesheet.employee?.fullName || "Unknown Employee"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Week ending {formatDate(timesheet.weekEnding)} • {timesheet.totalHours}h total
                        {parseFloat(timesheet.overtimeHours) > 0 && (
                          <span className="text-orange-600"> • {timesheet.overtimeHours}h OT</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails('timesheet', timesheet.id)}
                        data-testid={`button-view-timesheet-${timesheet.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApproveTimesheet(timesheet.id)}
                        className="text-green-600 hover:text-green-700"
                        data-testid={`button-approve-timesheet-${timesheet.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDenyTimesheet(timesheet.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-deny-timesheet-${timesheet.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Leave Requests */}
            {pendingLeaveRequests.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Leave Request Approvals ({pendingLeaveRequests.length})
                </h4>
                {pendingLeaveRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                    data-testid={`leave-approval-${request.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.employee?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {request.employee ? getInitials(request.employee.fullName) : "?"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {request.employee?.fullName || "Unknown Employee"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {leaveTypeLabels[request.leaveType]} • {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.hoursRequested}h requested
                        {request.reason && ` • ${request.reason.slice(0, 50)}${request.reason.length > 50 ? '...' : ''}`}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetails('leave', request.id)}
                        data-testid={`button-view-leave-${request.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onApproveLeaveRequest(request.id)}
                        className="text-green-600 hover:text-green-700"
                        data-testid={`button-approve-leave-${request.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDenyLeaveRequest(request.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-deny-leave-${request.id}`}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}