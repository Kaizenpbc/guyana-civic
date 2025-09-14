import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, DollarSign, Edit } from "lucide-react";

interface TimesheetEntry {
  date: string;
  hoursWorked: number;
  overtimeHours?: number;
  project?: string;
  notes?: string;
}

interface TimesheetCardProps {
  id: string;
  weekEnding: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  status: "draft" | "submitted" | "approved" | "rejected";
  employeeName: string;
  entries: TimesheetEntry[];
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  isEditable?: boolean;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export default function TimesheetCard({
  id,
  weekEnding,
  totalHours,
  regularHours,
  overtimeHours,
  status,
  employeeName,
  entries,
  onEdit,
  onView,
  isEditable = true,
}: TimesheetCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="hover-elevate" data-testid={`card-timesheet-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Week Ending {formatDate(weekEnding)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{employeeName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {isEditable && status === 'draft' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(id)}
              data-testid={`button-edit-timesheet-${id}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span>Total Hours</span>
            </div>
            <div className="text-2xl font-bold">{totalHours}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Regular</div>
            <div className="text-xl font-semibold text-green-600">{regularHours}</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Overtime</div>
            <div className="text-xl font-semibold text-orange-600">{overtimeHours}</div>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Entries</h4>
            <div className="space-y-1">
              {entries.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{formatDate(entry.date)}</span>
                  <span className="font-medium">{entry.hoursWorked}h</span>
                </div>
              ))}
              {entries.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">
                  +{entries.length - 3} more entries
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{entries.length} days logged</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(id)}
            data-testid={`button-view-timesheet-${id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}