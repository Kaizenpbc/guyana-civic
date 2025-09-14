import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Plus, FileText } from "lucide-react";

interface LeaveBalance {
  id: string;
  leaveType: "vacation" | "sick" | "personal" | "bereavement" | "maternity" | "paternity";
  totalAllowed: string;
  usedHours: string;
  remainingHours: string;
  carryoverHours: string;
  year: number;
}

interface LeaveRequest {
  id: string;
  leaveType: "vacation" | "sick" | "personal" | "bereavement" | "maternity" | "paternity";
  startDate: string;
  endDate: string;
  hoursRequested: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
}

interface LeaveBalanceCardProps {
  balances: LeaveBalance[];
  recentRequests: LeaveRequest[];
  onRequestLeave: () => void;
  onViewAllRequests: () => void;
}

const leaveTypeLabels = {
  vacation: "Vacation",
  sick: "Sick Leave",
  personal: "Personal",
  bereavement: "Bereavement",
  maternity: "Maternity",
  paternity: "Paternity",
};

const leaveTypeColors = {
  vacation: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  sick: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  personal: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  bereavement: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  maternity: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  paternity: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
};

const requestStatusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  denied: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export default function LeaveBalanceCard({
  balances,
  recentRequests,
  onRequestLeave,
  onViewAllRequests,
}: LeaveBalanceCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateUsagePercentage = (used: string, total: string) => {
    const usedHours = parseFloat(used);
    const totalHours = parseFloat(total);
    return totalHours > 0 ? (usedHours / totalHours) * 100 : 0;
  };

  return (
    <Card className="hover-elevate" data-testid="card-leave-balance">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Leave Balances</CardTitle>
        <Button 
          size="sm" 
          onClick={onRequestLeave}
          data-testid="button-request-leave"
        >
          <Plus className="h-4 w-4 mr-1" />
          Request Leave
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Leave Balances */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Current Year Balances</h4>
            {balances.map((balance) => {
              const usagePercentage = calculateUsagePercentage(balance.usedHours, balance.totalAllowed);
              const remaining = parseFloat(balance.remainingHours);
              
              return (
                <div key={balance.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={leaveTypeColors[balance.leaveType]} variant="secondary">
                        {leaveTypeLabels[balance.leaveType]}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {balance.usedHours}h used of {balance.totalAllowed}h
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      {remaining}h remaining
                    </div>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className="h-2"
                    data-testid={`progress-${balance.leaveType}`}
                  />
                  {parseFloat(balance.carryoverHours) > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Includes {balance.carryoverHours}h carried over
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent Requests */}
          {recentRequests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">Recent Requests</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onViewAllRequests}
                  data-testid="button-view-all-requests"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View All
                </Button>
              </div>
              
              <div className="space-y-2">
                {recentRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    data-testid={`request-${request.id}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge className={leaveTypeColors[request.leaveType]} variant="secondary">
                        {leaveTypeLabels[request.leaveType]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="truncate">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{request.hoursRequested}h</span>
                      </div>
                    </div>
                    <Badge 
                      className={requestStatusColors[request.status]} 
                      variant="secondary"
                      data-testid={`status-${request.id}`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                ))}
                
                {recentRequests.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{recentRequests.length - 3} more requests
                  </div>
                )}
              </div>
            </div>
          )}

          {recentRequests.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent leave requests</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}