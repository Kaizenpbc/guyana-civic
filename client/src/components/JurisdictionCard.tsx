import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

interface JurisdictionCardProps {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  onSelect: (id: string) => void;
}

export default function JurisdictionCard({
  id,
  name,
  contactEmail,
  contactPhone,
  onSelect,
}: JurisdictionCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-jurisdiction-${id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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

        <div className="mt-4 pt-4">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSelect(id)}
            className="w-full"
            data-testid={`button-select-${id}`}
          >
            Select
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}