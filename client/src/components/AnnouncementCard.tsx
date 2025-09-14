import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface AnnouncementCardProps {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  isActive: boolean;
}

export default function AnnouncementCard({
  id,
  title,
  content,
  authorName,
  createdAt,
  isActive,
}: AnnouncementCardProps) {
  return (
    <Card className={isActive ? "border-primary/20" : "opacity-75"} data-testid={`card-announcement-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
        {isActive && (
          <Badge variant="default" data-testid={`badge-active-${id}`}>
            Active
          </Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{content}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span>By {authorName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}