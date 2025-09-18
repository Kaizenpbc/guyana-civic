import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  FileText,
  DollarSign,
  Calendar,
  RefreshCw,
  ChevronRight,
  MessageSquare,
  Paperclip
} from 'lucide-react';

interface ApprovalStep {
  role: 'pm' | 'rdc_manager' | 'minister';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  dueDate?: string;
}

interface Approval {
  id: string;
  type: 'budget_increase' | 'change_request' | 'contract_approval';
  title: string;
  description: string;
  amount: number;
  projectId: string;
  projectName: string;
  requesterId: string;
  requesterName: string;
  currentApprover: string;
  approvalChain: ApprovalStep[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'budget' | 'scope_change' | 'contract';
  submittedAt: string;
  dueDate: string;
  justification: string;
  attachments: string[];
  status: 'in_review' | 'approved' | 'rejected';
}

interface ApprovalsData {
  approvals: Approval[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    overdue: number;
  };
}

interface ApprovalWorkflowsProps {
  userRole?: string;
}

const ApprovalWorkflows: React.FC<ApprovalWorkflowsProps> = ({ userRole = 'pm' }) => {
  const [approvalsData, setApprovalsData] = useState<ApprovalsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionComments, setActionComments] = useState('');
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would be an API call
      // For now, we'll simulate the approvals data
      const mockData: ApprovalsData = {
        approvals: [
          {
            id: 'approval-budget-001',
            type: 'budget_increase',
            title: 'Budget Increase Request - Anna Regina Sports Complex',
            description: 'Request for $150,000 budget increase due to material cost escalation',
            amount: 150000,
            projectId: 'proj-pm-4',
            projectName: 'Anna Regina Sports Complex',
            requesterId: 'user-6',
            requesterName: 'Project Manager',
            currentApprover: 'rdc_manager',
            approvalChain: [
              { role: 'pm', status: 'approved', approvedBy: 'user-6', approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
              { role: 'rdc_manager', status: 'pending', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
              { role: 'minister', status: 'pending' }
            ],
            priority: 'high',
            category: 'budget',
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            justification: 'Material costs have increased by 15% due to global supply chain issues. Additional funds required to complete construction without delays.',
            attachments: ['cost_analysis.pdf', 'supplier_quotes.pdf'],
            status: 'in_review'
          },
          {
            id: 'approval-change-002',
            type: 'change_request',
            title: 'Change Request - Essequibo Coast School Renovation',
            description: 'Addition of solar panel installation to existing renovation scope',
            amount: 75000,
            projectId: 'proj-pm-1',
            projectName: 'Essequibo Coast School Renovation',
            requesterId: 'user-6',
            requesterName: 'Project Manager',
            currentApprover: 'rdc_manager',
            approvalChain: [
              { role: 'pm', status: 'approved', approvedBy: 'user-6', approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
              { role: 'rdc_manager', status: 'pending', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() },
              { role: 'minister', status: 'pending' }
            ],
            priority: 'medium',
            category: 'scope_change',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            justification: 'Addition of solar panels will reduce long-term energy costs and provide sustainable energy solution for the school.',
            attachments: ['solar_proposal.pdf', 'energy_analysis.pdf'],
            status: 'in_review'
          }
        ],
        summary: {
          total: 2,
          pending: 2,
          approved: 0,
          rejected: 0,
          overdue: 0
        }
      };

      // Filter based on user role (simulate API filtering)
      if (userRole === 'rdc_manager') {
        mockData.approvals = mockData.approvals.filter(approval =>
          approval.currentApprover === 'rdc_manager'
        );
        mockData.summary = {
          total: mockData.approvals.length,
          pending: mockData.approvals.length,
          approved: 0,
          rejected: 0,
          overdue: 0
        };
      } else if (userRole === 'minister') {
        mockData.approvals = mockData.approvals.filter(approval =>
          approval.currentApprover === 'minister'
        );
        mockData.summary = {
          total: mockData.approvals.length,
          pending: mockData.approvals.length,
          approved: 0,
          rejected: 0,
          overdue: 0
        };
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      setApprovalsData(mockData);
    } catch (err) {
      setError('Failed to load approval workflows');
      console.error('Approvals fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [userRole]);

  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'deny') => {
    if (!selectedApproval) return;

    try {
      setProcessingAction(`${action}-${approvalId}`);

      // In a real app, this would be an API call
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the approval status locally
      setApprovalsData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          approvals: prev.approvals.map(approval =>
            approval.id === approvalId
              ? {
                  ...approval,
                  status: action === 'approve' ? 'approved' : 'rejected',
                  approvalChain: approval.approvalChain.map(step =>
                    step.role === userRole && step.status === 'pending'
                      ? {
                          ...step,
                          status: action === 'approve' ? 'approved' : 'rejected',
                          approvedBy: 'current_user',
                          approvedAt: new Date().toISOString()
                        }
                      : step
                  )
                }
              : approval
          )
        };
      });

      setSelectedApproval(null);
      setActionComments('');
      setProcessingAction(null);

      // Show success message (in real app, this would come from API)
      alert(`Approval ${action}d successfully!`);

    } catch (err) {
      console.error('Approval action error:', err);
      setProcessingAction(null);
      alert('Failed to process approval action');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'in_review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading approval workflows...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApprovals}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!approvalsData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Approval Workflows</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-100 text-blue-600">
                {approvalsData.summary.pending} Pending
              </Badge>
              <Button variant="outline" size="sm" onClick={fetchApprovals}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{approvalsData.summary.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{approvalsData.summary.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{approvalsData.summary.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{approvalsData.summary.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{approvalsData.summary.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Approvals */}
      {approvalsData.approvals.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvalsData.approvals.map((approval) => (
                <div key={approval.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{approval.title}</h3>
                        <Badge className={getPriorityColor(approval.priority)}>
                          {approval.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(approval.status)}>
                          {approval.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{approval.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(approval.amount)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(approval.dueDate).toLocaleDateString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{approval.requesterName}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprovalAction(approval.id, 'approve')}
                        disabled={processingAction === `approve-${approval.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {processingAction === `approve-${approval.id}` ? 'Processing...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApprovalAction(approval.id, 'deny')}
                        disabled={processingAction === `deny-${approval.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        {processingAction === `deny-${approval.id}` ? 'Processing...' : 'Deny'}
                      </Button>
                    </div>
                  </div>

                  {/* Approval Chain Progress */}
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Approval Progress:</div>
                    <div className="flex items-center space-x-2">
                      {approval.approvalChain.map((step, index) => (
                        <React.Fragment key={step.role}>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded ${
                            step.status === 'approved' ? 'bg-green-100 text-green-800' :
                            step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            step.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getStepStatusIcon(step.status)}
                            <span className="text-xs capitalize">{step.role.replace('_', ' ')}</span>
                          </div>
                          {index < approval.approvalChain.length - 1 && (
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All approvals have been processed.</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Approval Review</h2>
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Request Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Title:</strong> {selectedApproval.title}</div>
                      <div><strong>Type:</strong> {selectedApproval.type.replace('_', ' ')}</div>
                      <div><strong>Amount:</strong> {formatCurrency(selectedApproval.amount)}</div>
                      <div><strong>Priority:</strong>
                        <Badge className={`ml-2 ${getPriorityColor(selectedApproval.priority)}`}>
                          {selectedApproval.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Project & Requester</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Project:</strong> {selectedApproval.projectName}</div>
                      <div><strong>Requester:</strong> {selectedApproval.requesterName}</div>
                      <div><strong>Submitted:</strong> {new Date(selectedApproval.submittedAt).toLocaleDateString()}</div>
                      <div><strong>Due:</strong> {new Date(selectedApproval.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-gray-700">{selectedApproval.description}</p>
                </div>

                {/* Justification */}
                <div>
                  <h3 className="font-medium mb-2">Justification</h3>
                  <p className="text-sm text-gray-700">{selectedApproval.justification}</p>
                </div>

                {/* Attachments */}
                {selectedApproval.attachments.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Attachments</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApproval.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded text-sm">
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approval Chain */}
                <div>
                  <h3 className="font-medium mb-3">Approval Chain</h3>
                  <div className="space-y-3">
                    {selectedApproval.approvalChain.map((step, index) => (
                      <div key={step.role} className={`flex items-center justify-between p-3 rounded-lg border ${
                        step.status === 'approved' ? 'bg-green-50 border-green-200' :
                        step.status === 'rejected' ? 'bg-red-50 border-red-200' :
                        step.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {getStepStatusIcon(step.status)}
                          <div>
                            <div className="font-medium capitalize">{step.role.replace('_', ' ')}</div>
                            {step.approvedBy && (
                              <div className="text-sm text-gray-600">
                                by {step.approvedBy} on {new Date(step.approvedAt!).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            step.status === 'approved' ? 'text-green-600' :
                            step.status === 'rejected' ? 'text-red-600' :
                            step.status === 'pending' ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {step.status.toUpperCase()}
                          </div>
                          {step.dueDate && step.status === 'pending' && (
                            <div className="text-xs text-gray-500">
                              Due: {new Date(step.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Form */}
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-3">Your Decision</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Comments (Optional)</label>
                      <Textarea
                        placeholder="Add any comments about your decision..."
                        value={actionComments}
                        onChange={(e) => setActionComments(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => handleApprovalAction(selectedApproval.id, 'approve')}
                        disabled={processingAction === `approve-${selectedApproval.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {processingAction === `approve-${selectedApproval.id}` ? 'Processing...' : 'Approve Request'}
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleApprovalAction(selectedApproval.id, 'deny')}
                        disabled={processingAction === `deny-${selectedApproval.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {processingAction === `deny-${selectedApproval.id}` ? 'Processing...' : 'Deny Request'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflows;
