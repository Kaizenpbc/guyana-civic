import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, MoreVertical } from "lucide-react";

interface EmployeeCardProps {
  id: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  hireDate: string;
  salary?: number;
  isActive: boolean;
  avatarUrl?: string;
  onViewDetails: (id: string) => void;
  onEditEmployee?: (id: string) => void;
}

export default function EmployeeCard({
  id,
  fullName,
  position,
  department,
  email,
  phone,
  hireDate,
  salary,
  isActive,
  avatarUrl,
  onViewDetails,
  onEditEmployee,
}: EmployeeCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-employee-${id}`}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{fullName}</CardTitle>
            <p className="text-sm text-muted-foreground truncate">{position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "secondary"} data-testid={`badge-status-${id}`}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
          {onEditEmployee && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditEmployee(id)}
              data-testid={`button-edit-${id}`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{department}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{email}</span>
          </div>
          
          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{phone}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Hired {new Date(hireDate).toLocaleDateString()}
            </span>
          </div>
          
          {salary && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">Annual Salary</div>
              <div className="text-lg font-semibold">{formatSalary(salary)}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(id)}
            data-testid={`button-view-details-${id}`}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}