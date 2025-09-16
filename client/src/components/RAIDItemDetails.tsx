import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Calendar, User, FileText, AlertTriangle, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { 
  ProjectRisk, 
  ProjectIssue, 
  ProjectDecision, 
  ProjectAction,
  getStatusColor,
  getPriorityColor
} from '../api/risk-management-api';

interface RAIDItemDetailsProps {
  item: ProjectRisk | ProjectIssue | ProjectDecision | ProjectAction;
  type: 'risk' | 'issue' | 'decision' | 'action';
  onClose: () => void;
}

const RAIDItemDetails: React.FC<RAIDItemDetailsProps> = ({ item, type, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 4) return 'text-green-600 bg-green-100';
    if (score <= 8) return 'text-yellow-600 bg-yellow-100';
    if (score <= 12) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'issue': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'decision': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'action': return <Play className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'risk': return 'Risk Details';
      case 'issue': return 'Issue Details';
      case 'decision': return 'Decision Details';
      case 'action': return 'Action Details';
    }
  };

  const renderRiskDetails = (risk: ProjectRisk) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Category</label>
          <p className="text-sm text-gray-900 capitalize">{risk.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Risk Score</label>
          <div className="mt-1">
            <Badge className={getRiskScoreColor(risk.risk_score)}>
              {risk.risk_score}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Probability</label>
          <p className="text-sm text-gray-900 capitalize">{risk.probability}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Impact</label>
          <p className="text-sm text-gray-900 capitalize">{risk.impact}</p>
        </div>
      </div>
      
      {risk.mitigation_strategy && (
        <div>
          <label className="text-sm font-medium text-gray-500">Mitigation Strategy</label>
          <p className="text-sm text-gray-900 mt-1">{risk.mitigation_strategy}</p>
        </div>
      )}
      
      {risk.contingency_plan && (
        <div>
          <label className="text-sm font-medium text-gray-500">Contingency Plan</label>
          <p className="text-sm text-gray-900 mt-1">{risk.contingency_plan}</p>
        </div>
      )}
    </div>
  );

  const renderIssueDetails = (issue: ProjectIssue) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Category</label>
          <p className="text-sm text-gray-900 capitalize">{issue.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Severity</label>
          <p className="text-sm text-gray-900 capitalize">{issue.severity}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Priority</label>
          <div className="mt-1">
            <Badge className={getPriorityColor(issue.priority)}>
              {issue.priority}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge className={getStatusColor(issue.status)}>
              {issue.status}
            </Badge>
          </div>
        </div>
      </div>
      
      {issue.impact_description && (
        <div>
          <label className="text-sm font-medium text-gray-500">Impact Assessment</label>
          <p className="text-sm text-gray-900 mt-1">{issue.impact_description}</p>
        </div>
      )}
      
      {issue.resolution_plan && (
        <div>
          <label className="text-sm font-medium text-gray-500">Resolution Plan</label>
          <p className="text-sm text-gray-900 mt-1">{issue.resolution_plan}</p>
        </div>
      )}
    </div>
  );

  const renderDecisionDetails = (decision: ProjectDecision) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Decision Type</label>
          <p className="text-sm text-gray-900 capitalize">{decision.decision_type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge className={getStatusColor(decision.decision_status)}>
              {decision.decision_status}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Decision Maker</label>
          <p className="text-sm text-gray-900">{decision.decision_maker || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Approval Required</label>
          <p className="text-sm text-gray-900">{decision.approval_required ? 'Yes' : 'No'}</p>
        </div>
      </div>
      
      {decision.decision_criteria && (
        <div>
          <label className="text-sm font-medium text-gray-500">Decision Criteria</label>
          <p className="text-sm text-gray-900 mt-1">{decision.decision_criteria}</p>
        </div>
      )}
      
      {decision.options_considered && (
        <div>
          <label className="text-sm font-medium text-gray-500">Options Considered</label>
          <p className="text-sm text-gray-900 mt-1">{decision.options_considered}</p>
        </div>
      )}
      
      {decision.chosen_option && (
        <div>
          <label className="text-sm font-medium text-gray-500">Chosen Option</label>
          <p className="text-sm text-gray-900 mt-1">{decision.chosen_option}</p>
        </div>
      )}
      
      {decision.rationale && (
        <div>
          <label className="text-sm font-medium text-gray-500">Rationale</label>
          <p className="text-sm text-gray-900 mt-1">{decision.rationale}</p>
        </div>
      )}
    </div>
  );

  const renderActionDetails = (action: ProjectAction) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Action Type</label>
          <p className="text-sm text-gray-900 capitalize">{action.action_type}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Priority</label>
          <div className="mt-1">
            <Badge className={getPriorityColor(action.priority)}>
              {action.priority}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge className={getStatusColor(action.status)}>
              {action.status}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Assigned To</label>
          <p className="text-sm text-gray-900">{action.assigned_to || '-'}</p>
        </div>
      </div>
      
      {action.completion_notes && (
        <div>
          <label className="text-sm font-medium text-gray-500">Completion Notes</label>
          <p className="text-sm text-gray-900 mt-1">{action.completion_notes}</p>
        </div>
      )}
    </div>
  );

  const renderDetails = () => {
    switch (type) {
      case 'risk': return renderRiskDetails(item as ProjectRisk);
      case 'issue': return renderIssueDetails(item as ProjectIssue);
      case 'decision': return renderDecisionDetails(item as ProjectDecision);
      case 'action': return renderActionDetails(item as ProjectAction);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTypeIcon()}
              <div>
                <CardTitle className="text-xl font-bold">{getTypeTitle()}</CardTitle>
                <p className="text-gray-600 mt-1">{item.title}</p>
              </div>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {item.description && (
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-sm text-gray-900 mt-1">{item.description}</p>
            </div>
          )}

          {/* Type-specific details */}
          {renderDetails()}

          {/* Common fields */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm text-gray-900">{formatDate(item.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900">{formatDate(item.updated_at)}</p>
            </div>
          </div>

          {/* Due date if applicable */}
          {'due_date' in item && item.due_date && (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500">Due Date</label>
              </div>
              <p className="text-sm text-gray-900 mt-1">{formatDate(item.due_date)}</p>
            </div>
          )}

          {/* Owner/Assigned To if applicable */}
          {('owner_id' in item && item.owner_id) || ('assigned_to' in item && item.assigned_to) ? (
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-500">
                  {type === 'action' ? 'Assigned To' : 'Owner'}
                </label>
              </div>
              <p className="text-sm text-gray-900 mt-1">
                {('owner_id' in item ? item.owner_id : item.assigned_to) || '-'}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default RAIDItemDetails;
