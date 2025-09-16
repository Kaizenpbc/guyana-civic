// Risk Management API Functions (Phase 1)

// Types
export interface ProjectRisk {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: 'technical' | 'financial' | 'regulatory' | 'stakeholder' | 'environmental' | 'operational' | 'schedule' | 'quality';
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed' | 'escalated';
  mitigation_strategy?: string;
  contingency_plan?: string;
  owner_id?: string;
  assigned_to?: string;
  due_date?: string;
  escalated_to_issue_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectIssue {
  id: string;
  project_id: string;
  risk_id?: string;
  title: string;
  description?: string;
  category: 'technical' | 'financial' | 'regulatory' | 'stakeholder' | 'environmental' | 'operational' | 'schedule' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'investigating' | 'resolving' | 'resolved' | 'closed' | 'escalated';
  impact_description?: string;
  root_cause?: string;
  resolution_plan?: string;
  actual_resolution?: string;
  owner_id?: string;
  assigned_to?: string;
  reported_by: string;
  due_date?: string;
  resolved_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDecision {
  id: string;
  project_id: string;
  issue_id?: string;
  title: string;
  description?: string;
  decision_type: 'technical' | 'business' | 'resource' | 'schedule' | 'scope' | 'quality' | 'risk';
  decision_status: 'pending' | 'approved' | 'rejected' | 'deferred' | 'implemented';
  decision_criteria?: string;
  options_considered?: string;
  chosen_option?: string;
  rationale?: string;
  decision_maker?: string;
  stakeholders?: any;
  approval_required: boolean;
  approved_by?: string;
  approved_at?: string;
  implementation_deadline?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectAction {
  id: string;
  project_id: string;
  decision_id?: string;
  issue_id?: string;
  risk_id?: string;
  title: string;
  description?: string;
  action_type: 'mitigation' | 'resolution' | 'implementation' | 'monitoring' | 'communication' | 'escalation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  assigned_to?: string;
  created_by: string;
  due_date?: string;
  completed_date?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

// Risk Management API Functions

// =============================================
// RISK MANAGEMENT
// =============================================

export const getProjectRisks = async (projectId: string): Promise<{ risks: ProjectRisk[], total: number }> => {
  const response = await fetch(`/api/projects/${projectId}/risks`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch risks');
  }
  return response.json();
};

export const createRisk = async (projectId: string, riskData: Partial<ProjectRisk>): Promise<ProjectRisk> => {
  const response = await fetch(`/api/projects/${projectId}/risks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(riskData),
  });
  if (!response.ok) {
    throw new Error('Failed to create risk');
  }
  return response.json();
};

export const updateRisk = async (riskId: string, updateData: Partial<ProjectRisk>): Promise<any> => {
  const response = await fetch(`/api/risks/${riskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update risk');
  }
  return response.json();
};

export const escalateRiskToIssue = async (riskId: string, issueData: Partial<ProjectIssue>): Promise<any> => {
  const response = await fetch(`/api/risks/${riskId}/escalate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(issueData),
  });
  if (!response.ok) {
    throw new Error('Failed to escalate risk to issue');
  }
  return response.json();
};

// =============================================
// ISSUE MANAGEMENT
// =============================================

export const getProjectIssues = async (projectId: string): Promise<{ issues: ProjectIssue[], total: number }> => {
  const response = await fetch(`/api/projects/${projectId}/issues`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch issues');
  }
  return response.json();
};

export const createIssue = async (projectId: string, issueData: Partial<ProjectIssue>): Promise<ProjectIssue> => {
  const response = await fetch(`/api/projects/${projectId}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(issueData),
  });
  if (!response.ok) {
    throw new Error('Failed to create issue');
  }
  return response.json();
};

export const updateIssue = async (issueId: string, updateData: Partial<ProjectIssue>): Promise<any> => {
  const response = await fetch(`/api/issues/${issueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update issue');
  }
  return response.json();
};

// =============================================
// DECISION MANAGEMENT
// =============================================

export const getProjectDecisions = async (projectId: string): Promise<{ decisions: ProjectDecision[], total: number }> => {
  const response = await fetch(`/api/projects/${projectId}/decisions`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch decisions');
  }
  return response.json();
};

export const createDecision = async (projectId: string, decisionData: Partial<ProjectDecision>): Promise<ProjectDecision> => {
  const response = await fetch(`/api/projects/${projectId}/decisions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(decisionData),
  });
  if (!response.ok) {
    throw new Error('Failed to create decision');
  }
  return response.json();
};

export const updateDecision = async (decisionId: string, updateData: Partial<ProjectDecision>): Promise<any> => {
  const response = await fetch(`/api/decisions/${decisionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update decision');
  }
  return response.json();
};

// =============================================
// ACTION MANAGEMENT
// =============================================

export const getProjectActions = async (projectId: string): Promise<{ actions: ProjectAction[], total: number }> => {
  const response = await fetch(`/api/projects/${projectId}/actions`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch actions');
  }
  return response.json();
};

export const createAction = async (projectId: string, actionData: Partial<ProjectAction>): Promise<ProjectAction> => {
  const response = await fetch(`/api/projects/${projectId}/actions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(actionData),
  });
  if (!response.ok) {
    throw new Error('Failed to create action');
  }
  return response.json();
};

export const updateAction = async (actionId: string, updateData: Partial<ProjectAction>): Promise<any> => {
  const response = await fetch(`/api/actions/${actionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    throw new Error('Failed to update action');
  }
  return response.json();
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const getRiskScoreColor = (score: number): string => {
  if (score <= 4) return 'text-green-600 bg-green-100';
  if (score <= 8) return 'text-yellow-600 bg-yellow-100';
  if (score <= 12) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
};

export const getRiskScoreLabel = (score: number): string => {
  if (score <= 4) return 'Low';
  if (score <= 8) return 'Medium';
  if (score <= 12) return 'High';
  return 'Critical';
};

export const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    // Risk statuses
    'identified': 'text-blue-600 bg-blue-100',
    'assessed': 'text-purple-600 bg-purple-100',
    'mitigated': 'text-green-600 bg-green-100',
    'monitored': 'text-yellow-600 bg-yellow-100',
    'closed': 'text-gray-600 bg-gray-100',
    'escalated': 'text-red-600 bg-red-100',
    
    // Issue statuses
    'open': 'text-red-600 bg-red-100',
    'investigating': 'text-yellow-600 bg-yellow-100',
    'resolving': 'text-blue-600 bg-blue-100',
    'resolved': 'text-green-600 bg-green-100',
    'issue_closed': 'text-gray-600 bg-gray-100',
    
    // Decision statuses
    'decision_pending': 'text-yellow-600 bg-yellow-100',
    'approved': 'text-green-600 bg-green-100',
    'rejected': 'text-red-600 bg-red-100',
    'deferred': 'text-gray-600 bg-gray-100',
    'implemented': 'text-blue-600 bg-blue-100',
    
    // Action statuses
    'action_pending': 'text-gray-600 bg-gray-100',
    'in_progress': 'text-blue-600 bg-blue-100',
    'completed': 'text-green-600 bg-green-100',
    'cancelled': 'text-red-600 bg-red-100',
    'on_hold': 'text-yellow-600 bg-yellow-100'
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

export const getPriorityColor = (priority: string): string => {
  const priorityColors: { [key: string]: string } = {
    'low': 'text-green-600 bg-green-100',
    'medium': 'text-yellow-600 bg-yellow-100',
    'high': 'text-orange-600 bg-orange-100',
    'urgent': 'text-red-600 bg-red-100',
    'critical': 'text-red-600 bg-red-100'
  };
  
  return priorityColors[priority] || 'text-gray-600 bg-gray-100';
};

