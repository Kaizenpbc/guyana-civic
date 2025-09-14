import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface IssueCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "acknowledged" | "in_progress" | "resolved" | "closed";
  location: string;
  citizenName: string;
  createdAt: string;
  onView: (id: string) => void;
}

const priorityColors = {
  low: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  medium: "bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 dark:text-secondary-foreground",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  urgent: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

const statusConfig = {
  submitted: { icon: AlertCircle, color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  acknowledged: { icon: Clock, color: "bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 dark:text-secondary-foreground" },
  in_progress: { icon: Clock, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  resolved: { icon: CheckCircle, color: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" },
  closed: { icon: CheckCircle, color: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground" },
};

export default function IssueCard({
  id,
  title,
  description,
  category,
  priority,
  status,
  location,
  citizenName,
  createdAt,
  onView,
}: IssueCardProps) {
  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className="hover-elevate" data-testid={`card-issue-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 flex-1">
          <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="capitalize" data-testid={`badge-category-${id}`}>
              {category}
            </Badge>
            <Badge className={priorityColors[priority]} data-testid={`badge-priority-${id}`}>
              {priority}
            </Badge>
          </div>
        </div>
        <Badge className={statusConfig[status].color} data-testid={`badge-status-${id}`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.replace('_', ' ')}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reported by {citizenName}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(id)}
            data-testid={`button-view-issue-${id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}