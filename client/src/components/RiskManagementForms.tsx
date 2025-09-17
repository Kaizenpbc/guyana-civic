import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, FileText, Target, X } from 'lucide-react';
import SmartAutoComplete from './SmartAutoComplete';
import { 
  ProjectRisk, 
  ProjectIssue, 
  ProjectDecision, 
  ProjectAction,
  createRisk,
  createIssue,
  createDecision,
  createAction,
  getRiskScoreColor,
  getRiskScoreLabel,
  getStatusColor,
  getPriorityColor
} from '@/api/risk-management-api';

interface RiskManagementFormsProps {
  projectId?: string;
  project?: any;
  projects?: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const RiskManagementForms: React.FC<RiskManagementFormsProps> = ({ 
  projectId, 
  project,
  projects = [],
  onClose, 
  onSuccess 
}) => {
  const [activeTab, setActiveTab] = useState<'risk' | 'issue' | 'decision' | 'action'>('risk');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || '');
  const [selectedProject, setSelectedProject] = useState<any>(project);

  // Risk form state
  const [riskForm, setRiskForm] = useState({
    title: '',
    description: '',
    category: 'technical' as const,
    probability: 'medium' as const,
    impact: 'medium' as const,
    mitigation_strategy: '',
    contingency_plan: '',
    due_date: '',
    owner_id: ''
  });

  // Issue form state
  const [issueForm, setIssueForm] = useState({
    title: '',
    description: '',
    category: 'technical' as const,
    severity: 'medium' as const,
    priority: 'medium' as const,
    impact_description: '',
    root_cause: '',
    resolution_plan: '',
    due_date: '',
    owner_id: ''
  });

  // Decision form state
  const [decisionForm, setDecisionForm] = useState({
    title: '',
    description: '',
    decision_type: 'technical' as const,
    decision_criteria: '',
    options_considered: '',
    chosen_option: '',
    rationale: '',
    implementation_deadline: '',
    decision_maker: ''
  });

  // Action form state
  const [actionForm, setActionForm] = useState({
    title: '',
    description: '',
    action_type: 'mitigation' as const,
    priority: 'medium' as const,
    due_date: ''
  });

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await createRisk(selectedProjectId, riskForm);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating risk:', error);
      alert('Failed to create risk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await createIssue(selectedProjectId, issueForm);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating issue:', error);
      alert('Failed to create issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await createDecision(selectedProjectId, decisionForm);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating decision:', error);
      alert('Failed to create decision. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select a project first.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await createAction(selectedProjectId, actionForm);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating action:', error);
      alert('Failed to create action. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'risk', label: 'Risk', icon: AlertTriangle, color: 'text-red-600' },
    { id: 'issue', label: 'Issue', icon: AlertTriangle, color: 'text-orange-600' },
    { id: 'decision', label: 'Decision', icon: CheckCircle, color: 'text-blue-600' },
    { id: 'action', label: 'Action', icon: Target, color: 'text-green-600' }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">RAID Management</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${activeTab === tab.id ? tab.color : ''}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Project Selector */}
          {projects.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="project-selector" className="text-sm font-medium text-blue-900">
                Select Project *
              </Label>
              <Select 
                value={selectedProjectId} 
                onValueChange={(value) => {
                  setSelectedProjectId(value);
                  const project = projects.find(p => p.id === value);
                  setSelectedProject(project);
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProject && (
                <div className="mt-2 text-sm text-blue-700">
                  <strong>Selected:</strong> {selectedProject.name} ({selectedProject.category})
                </div>
              )}
            </div>
          )}

          {/* Risk Form */}
          {activeTab === 'risk' && (
            <form onSubmit={handleRiskSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk-title">Risk Title *</Label>
                  <SmartAutoComplete
                    value={riskForm.title}
                    onChange={(value) => setRiskForm({ ...riskForm, title: value })}
                    placeholder="Enter risk title"
                    fieldType="risk_title"
                    projectCategory={selectedProject?.category || 'infrastructure'}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="risk-category">Category *</Label>
                  <Select value={riskForm.category} onValueChange={(value: any) => setRiskForm({ ...riskForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="risk-description">Description</Label>
                <SmartAutoComplete
                  value={riskForm.description}
                  onChange={(value) => setRiskForm({ ...riskForm, description: value })}
                  placeholder="Describe the risk in detail"
                  fieldType="description"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="risk-probability">Probability *</Label>
                  <Select value={riskForm.probability} onValueChange={(value: any) => setRiskForm({ ...riskForm, probability: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="risk-impact">Impact *</Label>
                  <Select value={riskForm.impact} onValueChange={(value: any) => setRiskForm({ ...riskForm, impact: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Risk Score Display */}
              {riskForm.probability && riskForm.impact && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Risk Score:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {(() => {
                          const probabilityScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const score = probabilityScores[riskForm.probability] * impactScores[riskForm.impact];
                          return score;
                        })()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (() => {
                          const probabilityScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const score = probabilityScores[riskForm.probability] * impactScores[riskForm.impact];
                          if (score <= 4) return 'bg-green-100 text-green-800';
                          if (score <= 8) return 'bg-yellow-100 text-yellow-800';
                          if (score <= 12) return 'bg-orange-100 text-orange-800';
                          return 'bg-red-100 text-red-800';
                        })()
                      }`}>
                        {(() => {
                          const probabilityScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const impactScores = { low: 1, medium: 2, high: 3, critical: 4 };
                          const score = probabilityScores[riskForm.probability] * impactScores[riskForm.impact];
                          if (score <= 4) return 'Low Risk';
                          if (score <= 8) return 'Medium Risk';
                          if (score <= 12) return 'High Risk';
                          return 'Critical Risk';
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    Probability ({riskForm.probability}) × Impact ({riskForm.impact}) = Risk Score
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="risk-mitigation">Mitigation Strategy</Label>
                <SmartAutoComplete
                  value={riskForm.mitigation_strategy}
                  onChange={(value) => setRiskForm({ ...riskForm, mitigation_strategy: value })}
                  placeholder="Describe how to mitigate this risk"
                  fieldType="mitigation_strategy"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="risk-contingency">Contingency Plan</Label>
                <SmartAutoComplete
                  value={riskForm.contingency_plan}
                  onChange={(value) => setRiskForm({ ...riskForm, contingency_plan: value })}
                  placeholder="Describe the contingency plan if risk occurs"
                  fieldType="contingency_plan"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="risk-due-date">Due Date</Label>
                <Input
                  id="risk-due-date"
                  type="date"
                  value={riskForm.due_date}
                  onChange={(e) => setRiskForm({ ...riskForm, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="risk-owner">Owner</Label>
                <Input
                  id="risk-owner"
                  value={riskForm.owner_id || ''}
                  onChange={(e) => setRiskForm({ ...riskForm, owner_id: e.target.value })}
                  placeholder="Enter owner name or ID"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Risk'}
                </Button>
              </div>
            </form>
          )}

          {/* Issue Form */}
          {activeTab === 'issue' && (
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue-title">Issue Title *</Label>
                  <Input
                    id="issue-title"
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                    placeholder="Enter issue title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="issue-category">Category *</Label>
                  <Select value={issueForm.category} onValueChange={(value: any) => setIssueForm({ ...issueForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="issue-description">Description</Label>
                <SmartAutoComplete
                  value={issueForm.description}
                  onChange={(value) => setIssueForm({ ...issueForm, description: value })}
                  placeholder="Describe the issue in detail"
                  fieldType="description"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue-severity">Severity *</Label>
                  <Select value={issueForm.severity} onValueChange={(value: any) => setIssueForm({ ...issueForm, severity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="issue-priority">Priority *</Label>
                  <Select value={issueForm.priority} onValueChange={(value: any) => setIssueForm({ ...issueForm, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="issue-impact">Impact Description</Label>
                <SmartAutoComplete
                  value={issueForm.impact_description}
                  onChange={(value) => setIssueForm({ ...issueForm, impact_description: value })}
                  placeholder="Describe the impact of this issue"
                  fieldType="description"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="issue-root-cause">Root Cause</Label>
                <Textarea
                  id="issue-root-cause"
                  value={issueForm.root_cause}
                  onChange={(e) => setIssueForm({ ...issueForm, root_cause: e.target.value })}
                  placeholder="Identify the root cause of the issue"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="issue-resolution">Resolution Plan</Label>
                <SmartAutoComplete
                  value={issueForm.resolution_plan}
                  onChange={(value) => setIssueForm({ ...issueForm, resolution_plan: value })}
                  placeholder="Describe the plan to resolve this issue"
                  fieldType="mitigation_strategy"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="issue-due-date">Due Date</Label>
                <Input
                  id="issue-due-date"
                  type="date"
                  value={issueForm.due_date}
                  onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="issue-owner">Owner</Label>
                <Input
                  id="issue-owner"
                  value={issueForm.owner_id || ''}
                  onChange={(e) => setIssueForm({ ...issueForm, owner_id: e.target.value })}
                  placeholder="Enter owner name or ID"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Issue'}
                </Button>
              </div>
            </form>
          )}

          {/* Decision Form */}
          {activeTab === 'decision' && (
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="decision-title">Decision Title *</Label>
                  <Input
                    id="decision-title"
                    value={decisionForm.title}
                    onChange={(e) => setDecisionForm({ ...decisionForm, title: e.target.value })}
                    placeholder="Enter decision title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="decision-type">Decision Type *</Label>
                  <Select value={decisionForm.decision_type} onValueChange={(value: any) => setDecisionForm({ ...decisionForm, decision_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                      <SelectItem value="scope">Scope</SelectItem>
                      <SelectItem value="quality">Quality</SelectItem>
                      <SelectItem value="risk">Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="decision-description">Description</Label>
                <SmartAutoComplete
                  value={decisionForm.description}
                  onChange={(value) => setDecisionForm({ ...decisionForm, description: value })}
                  placeholder="Describe the decision context"
                  fieldType="description"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="decision-criteria">Decision Criteria</Label>
                <SmartAutoComplete
                  value={decisionForm.decision_criteria}
                  onChange={(value) => setDecisionForm({ ...decisionForm, decision_criteria: value })}
                  placeholder="List the criteria used to make this decision"
                  fieldType="mitigation_strategy"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="decision-options">Options Considered</Label>
                <Textarea
                  id="decision-options"
                  value={decisionForm.options_considered}
                  onChange={(e) => setDecisionForm({ ...decisionForm, options_considered: e.target.value })}
                  placeholder="List all options that were considered"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="decision-chosen">Chosen Option</Label>
                <Textarea
                  id="decision-chosen"
                  value={decisionForm.chosen_option}
                  onChange={(e) => setDecisionForm({ ...decisionForm, chosen_option: e.target.value })}
                  placeholder="Describe the chosen option"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="decision-rationale">Rationale</Label>
                <Textarea
                  id="decision-rationale"
                  value={decisionForm.rationale}
                  onChange={(e) => setDecisionForm({ ...decisionForm, rationale: e.target.value })}
                  placeholder="Explain why this option was chosen"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="decision-deadline">Implementation Deadline</Label>
                <Input
                  id="decision-deadline"
                  type="date"
                  value={decisionForm.implementation_deadline}
                  onChange={(e) => setDecisionForm({ ...decisionForm, implementation_deadline: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="decision-maker">Decision Maker</Label>
                <Input
                  id="decision-maker"
                  value={decisionForm.decision_maker || ''}
                  onChange={(e) => setDecisionForm({ ...decisionForm, decision_maker: e.target.value })}
                  placeholder="Enter decision maker name or ID"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Decision'}
                </Button>
              </div>
            </form>
          )}

          {/* Action Form */}
          {activeTab === 'action' && (
            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action-title">Action Title *</Label>
                  <Input
                    id="action-title"
                    value={actionForm.title}
                    onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
                    placeholder="Enter action title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="action-type">Action Type *</Label>
                  <Select value={actionForm.action_type} onValueChange={(value: any) => setActionForm({ ...actionForm, action_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mitigation">Mitigation</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="implementation">Implementation</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="communication">Communication</SelectItem>
                      <SelectItem value="escalation">Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="action-description">Description</Label>
                <SmartAutoComplete
                  value={actionForm.description}
                  onChange={(value) => setActionForm({ ...actionForm, description: value })}
                  placeholder="Describe the action in detail"
                  fieldType="description"
                  projectCategory={selectedProject?.category || 'infrastructure'}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="action-priority">Priority *</Label>
                <Select value={actionForm.priority} onValueChange={(value: any) => setActionForm({ ...actionForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action-due-date">Due Date</Label>
                <Input
                  id="action-due-date"
                  type="date"
                  value={actionForm.due_date}
                  onChange={(e) => setActionForm({ ...actionForm, due_date: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Action'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskManagementForms;
