import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Download, Eye } from "lucide-react";

interface PaystubCardProps {
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
  onView: (id: string) => void;
  onDownload?: (id: string) => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  issued: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  corrected: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function PaystubCard({
  id,
  payPeriodStart,
  payPeriodEnd,
  payDate,
  grossPay,
  federalTax,
  stateTax,
  socialSecurity,
  medicare,
  retirement,
  healthcare,
  otherDeductions,
  netPay,
  status,
  onView,
  onDownload,
}: PaystubCardProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const totalDeductions = (
    parseFloat(federalTax) +
    parseFloat(stateTax) +
    parseFloat(socialSecurity) +
    parseFloat(medicare) +
    parseFloat(retirement) +
    parseFloat(healthcare) +
    parseFloat(otherDeductions)
  ).toFixed(2);

  return (
    <Card className="hover-elevate" data-testid={`card-paystub-${id}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">
            Pay Period: {formatDate(payPeriodStart)} - {formatDate(payPeriodEnd)}
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Paid on {formatDate(payDate)}</span>
          </div>
        </div>
        <Badge className={statusColors[status]} data-testid={`badge-status-${id}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Net Pay - Most Important */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="font-medium">Net Pay</span>
            </div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(netPay)}
            </div>
          </div>

          {/* Gross Pay and Total Deductions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Gross Pay</div>
              <div className="text-lg font-semibold">{formatCurrency(grossPay)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Total Deductions</div>
              <div className="text-lg font-semibold text-red-600">
                -{formatCurrency(totalDeductions)}
              </div>
            </div>
          </div>

          {/* Deduction Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Deduction Breakdown</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Federal Tax:</span>
                <span>{formatCurrency(federalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State Tax:</span>
                <span>{formatCurrency(stateTax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Social Security:</span>
                <span>{formatCurrency(socialSecurity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medicare:</span>
                <span>{formatCurrency(medicare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Retirement:</span>
                <span>{formatCurrency(retirement)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Healthcare:</span>
                <span>{formatCurrency(healthcare)}</span>
              </div>
            </div>
            {parseFloat(otherDeductions) > 0 && (
              <div className="flex justify-between text-sm pt-1 border-t">
                <span className="text-muted-foreground">Other Deductions:</span>
                <span>{formatCurrency(otherDeductions)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(id)}
            className="flex-1"
            data-testid={`button-view-paystub-${id}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
          {onDownload && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDownload(id)}
              data-testid={`button-download-paystub-${id}`}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}