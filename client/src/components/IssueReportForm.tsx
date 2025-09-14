import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Camera, Send, CheckCircle, AlertCircle } from "lucide-react";

interface IssueReportFormProps {
  jurisdictionId: string;
  onSubmit?: (issueData: any) => void;
  onCancel?: () => void;
}

interface IssueSubmissionData {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
}

interface IssueSubmissionResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  citizenId: string;
  jurisdictionId: string;
  createdAt: string;
}

const categories = [
  { value: "roads", label: "Roads & Transportation" },
  { value: "drainage", label: "Drainage & Water" },
  { value: "utilities", label: "Utilities" },
  { value: "waste", label: "Waste Management" },
  { value: "lighting", label: "Street Lighting" },
  { value: "parks", label: "Parks & Recreation" },
  { value: "other", label: "Other" },
];

const priorities = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
];

// API function to submit issue
const submitIssue = async (jurisdictionId: string, issueData: IssueSubmissionData): Promise<IssueSubmissionResponse> => {
  const response = await fetch(`/api/jurisdictions/${jurisdictionId}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(issueData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to submit issue');
  }

  return response.json();
};

export default function IssueReportForm({ jurisdictionId, onSubmit, onCancel }: IssueReportFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
  });
  
  const queryClient = useQueryClient();
  
  const submitMutation = useMutation({
    mutationFn: (data: IssueSubmissionData) => submitIssue(jurisdictionId, data),
    onSuccess: (data) => {
      // Invalidate and refetch issues
      queryClient.invalidateQueries({ queryKey: ['issues', jurisdictionId] });
      onSubmit?.(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="form-issue-report">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Report an Issue
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Help us improve your community by reporting infrastructure issues or service problems.
        </p>
      </CardHeader>
      
      <CardContent>
        {submitMutation.isSuccess && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Issue submitted successfully! Your report has been received and will be reviewed by our team.
            </AlertDescription>
          </Alert>
        )}
        
        {submitMutation.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitMutation.error instanceof Error ? submitMutation.error.message : 'Failed to submit issue. Please try again.'}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
              data-testid="input-title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select onValueChange={(value) => handleInputChange("category", value)} required>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select issue category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select onValueChange={(value) => handleInputChange("priority", value)} defaultValue="medium">
                <SelectTrigger data-testid="select-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Street address or landmark"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="pl-10"
                required
                data-testid="input-location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the issue, including any safety concerns or impact on the community..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              required
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Add Photos (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover-elevate">
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to add photos or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Photos help us better understand the issue
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={submitMutation.isPending}
              data-testid="button-submit-issue"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                disabled={submitMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}