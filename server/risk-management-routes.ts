import express from 'express';
import { requireAuth, requireStaff } from './auth';

const app = express();

// =============================================
// RISK MANAGEMENT API ROUTES (Phase 1)
// =============================================

// Types for our entities
interface ProjectRisk {
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

interface ProjectIssue {
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

interface ProjectDecision {
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

interface ProjectAction {
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

// =============================================
// RISK MANAGEMENT ROUTES
// =============================================

// Get all risks for a project
app.get("/api/projects/:projectId/risks", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock data for now - will be replaced with database queries
    const risks: ProjectRisk[] = [
      {
        id: 'risk-1',
        project_id: projectId,
        title: 'Weather delays during construction',
        description: 'Heavy rainfall during construction season could delay project timeline',
        category: 'environmental',
        probability: 'medium',
        impact: 'high',
        risk_score: 6,
        status: 'identified',
        mitigation_strategy: 'Monitor weather forecasts and have indoor work alternatives ready',
        owner_id: 'user-6',
        assigned_to: 'user-6',
        created_by: 'user-6',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'risk-2',
        project_id: projectId,
        title: 'Material cost inflation',
        description: 'Rising material costs could exceed budget allocation',
        category: 'financial',
        probability: 'high',
        impact: 'medium',
        risk_score: 6,
        status: 'assessed',
        mitigation_strategy: 'Lock in material prices early and maintain 10% contingency buffer',
        owner_id: 'user-6',
        assigned_to: 'user-6',
        created_by: 'user-6',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    res.json({ risks, total: risks.length });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

// Create a new risk
app.post("/api/projects/:projectId/risks", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const riskData = req.body;
    
    const newRisk: ProjectRisk = {
      id: `risk-${Date.now()}`,
      project_id: projectId,
      title: riskData.title,
      description: riskData.description,
      category: riskData.category,
      probability: riskData.probability || 'medium',
      impact: riskData.impact || 'medium',
      risk_score: 0, // Will be calculated by database
      status: 'identified',
      mitigation_strategy: riskData.mitigation_strategy,
      contingency_plan: riskData.contingency_plan,
      owner_id: riskData.owner_id,
      assigned_to: riskData.assigned_to,
      due_date: riskData.due_date,
      created_by: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Save to database
    console.log('Creating new risk:', newRisk);
    
    res.status(201).json(newRisk);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

// Update a risk
app.put("/api/risks/:riskId", requireAuth, requireStaff, async (req, res) => {
  try {
    const { riskId } = req.params;
    const updateData = req.body;
    
    // TODO: Update in database
    console.log('Updating risk:', riskId, updateData);
    
    res.json({ success: true, message: 'Risk updated successfully' });
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

// Escalate risk to issue
app.post("/api/risks/:riskId/escalate", requireAuth, requireStaff, async (req, res) => {
  try {
    const { riskId } = req.params;
    const issueData = req.body;
    
    // TODO: Create issue from risk and update risk status
    console.log('Escalating risk to issue:', riskId, issueData);
    
    res.json({ success: true, message: 'Risk escalated to issue successfully' });
  } catch (error) {
    console.error('Error escalating risk:', error);
    res.status(500).json({ error: 'Failed to escalate risk' });
  }
});

// =============================================
// ISSUE MANAGEMENT ROUTES
// =============================================

// Get all issues for a project
app.get("/api/projects/:projectId/issues", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock data for now
    const issues: ProjectIssue[] = [
      {
        id: 'issue-1',
        project_id: projectId,
        title: 'Foundation excavation delays',
        description: 'Unexpected rock formation discovered during excavation',
        category: 'technical',
        severity: 'high',
        priority: 'high',
        status: 'investigating',
        impact_description: 'Project timeline delayed by 2 weeks, additional costs for specialized equipment',
        owner_id: 'user-6',
        assigned_to: 'user-6',
        reported_by: 'user-6',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    res.json({ issues, total: issues.length });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Create a new issue
app.post("/api/projects/:projectId/issues", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const issueData = req.body;
    
    const newIssue: ProjectIssue = {
      id: `issue-${Date.now()}`,
      project_id: projectId,
      risk_id: issueData.risk_id,
      title: issueData.title,
      description: issueData.description,
      category: issueData.category,
      severity: issueData.severity || 'medium',
      priority: issueData.priority || 'medium',
      status: 'open',
      impact_description: issueData.impact_description,
      root_cause: issueData.root_cause,
      resolution_plan: issueData.resolution_plan,
      owner_id: issueData.owner_id,
      assigned_to: issueData.assigned_to,
      reported_by: req.user.id,
      due_date: issueData.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Save to database
    console.log('Creating new issue:', newIssue);
    
    res.status(201).json(newIssue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

// =============================================
// DECISION MANAGEMENT ROUTES
// =============================================

// Get all decisions for a project
app.get("/api/projects/:projectId/decisions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock data for now
    const decisions: ProjectDecision[] = [
      {
        id: 'decision-1',
        project_id: projectId,
        issue_id: 'issue-1',
        title: 'Equipment rental vs purchase',
        description: 'Decide whether to rent specialized equipment or purchase for rock excavation',
        decision_type: 'technical',
        decision_status: 'approved',
        decision_criteria: 'Cost, timeline, future use',
        options_considered: '["Rent equipment for 2 weeks", "Purchase equipment", "Subcontract to specialized company"]',
        chosen_option: 'Subcontract to specialized company',
        rationale: 'Most cost-effective and fastest solution',
        decision_maker: 'user-6',
        approval_required: false,
        created_by: 'user-6',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    res.json({ decisions, total: decisions.length });
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

// Create a new decision
app.post("/api/projects/:projectId/decisions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const decisionData = req.body;
    
    const newDecision: ProjectDecision = {
      id: `decision-${Date.now()}`,
      project_id: projectId,
      issue_id: decisionData.issue_id,
      title: decisionData.title,
      description: decisionData.description,
      decision_type: decisionData.decision_type,
      decision_status: 'pending',
      decision_criteria: decisionData.decision_criteria,
      options_considered: decisionData.options_considered,
      chosen_option: decisionData.chosen_option,
      rationale: decisionData.rationale,
      decision_maker: decisionData.decision_maker,
      stakeholders: decisionData.stakeholders,
      approval_required: decisionData.approval_required || false,
      implementation_deadline: decisionData.implementation_deadline,
      created_by: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Save to database
    console.log('Creating new decision:', newDecision);
    
    res.status(201).json(newDecision);
  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

// =============================================
// ACTION MANAGEMENT ROUTES
// =============================================

// Get all actions for a project
app.get("/api/projects/:projectId/actions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock data for now
    const actions: ProjectAction[] = [
      {
        id: 'action-1',
        project_id: projectId,
        decision_id: 'decision-1',
        issue_id: 'issue-1',
        title: 'Contact specialized excavation company',
        description: 'Research and contact companies that specialize in rock excavation',
        action_type: 'resolution',
        priority: 'high',
        status: 'in_progress',
        assigned_to: 'user-6',
        created_by: 'user-6',
        due_date: '2024-02-15',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];

    res.json({ actions, total: actions.length });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

// Create a new action
app.post("/api/projects/:projectId/actions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const actionData = req.body;
    
    const newAction: ProjectAction = {
      id: `action-${Date.now()}`,
      project_id: projectId,
      decision_id: actionData.decision_id,
      issue_id: actionData.issue_id,
      risk_id: actionData.risk_id,
      title: actionData.title,
      description: actionData.description,
      action_type: actionData.action_type,
      priority: actionData.priority || 'medium',
      status: 'pending',
      assigned_to: actionData.assigned_to,
      created_by: req.user.id,
      due_date: actionData.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // TODO: Save to database
    console.log('Creating new action:', newAction);
    
    res.status(201).json(newAction);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

// Update action status
app.put("/api/actions/:actionId", requireAuth, requireStaff, async (req, res) => {
  try {
    const { actionId } = req.params;
    const updateData = req.body;
    
    // TODO: Update in database
    console.log('Updating action:', actionId, updateData);
    
    res.json({ success: true, message: 'Action updated successfully' });
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

export default app;
