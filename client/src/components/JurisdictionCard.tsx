import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Users } from "lucide-react";

interface JurisdictionCardProps {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  issueCount?: number;
  onSelect: (id: string) => void;
}

export default function JurisdictionCard({
  id,
  name,
  description,
  contactEmail,
  contactPhone,
  address,
  issueCount = 0,
  onSelect,
}: JurisdictionCardProps) {
  return (
    <Card className="hover-elevate cursor-pointer" onClick={() => onSelect(id)} data-testid={`card-jurisdiction-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        <Badge variant="secondary" data-testid={`badge-issues-${id}`}>
          {issueCount} issues
        </Badge>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}
        
        <div className="space-y-2">
          {address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{address}</span>
            </div>
          )}
          
          {contactPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{contactPhone}</span>
            </div>
          )}
          
          {contactEmail && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{contactEmail}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Local Government</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
            data-testid={`button-view-${id}`}
          >
            View Portal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}