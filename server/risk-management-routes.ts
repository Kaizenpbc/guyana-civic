import { Router } from 'express';

// Authentication middleware (copied from routes.ts)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

const requireStaff = (req: any, res: any, next: any) => {
  if (!req.user || !["staff", "admin", "super_admin", "pm"].includes(req.user.role)) {
    return res.status(403).json({ error: "Staff access required" });
  }
  next();
};

const router = Router();

// =============================================
// TYPES
// =============================================

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
// IN-MEMORY STORAGE (persists across requests)
// =============================================

const risks = new Map<string, ProjectRisk>();
const issues = new Map<string, ProjectIssue>();
const decisions = new Map<string, ProjectDecision>();
const actions = new Map<string, ProjectAction>();

// Seed with sample data
function seedData() {
  const now = new Date().toISOString();

  risks.set('risk-1', {
    id: 'risk-1',
    project_id: 'project-1',
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
    created_at: now,
    updated_at: now,
  });

  risks.set('risk-2', {
    id: 'risk-2',
    project_id: 'project-1',
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
    created_at: now,
    updated_at: now,
  });

  issues.set('issue-1', {
    id: 'issue-1',
    project_id: 'project-1',
    title: 'Foundation excavation delays',
    description: 'Unexpected rock formation discovered during excavation',
    category: 'technical',
    severity: 'high',
    priority: 'high',
    status: 'investigating',
    impact_description: 'Project timeline delayed by 2 weeks, additional costs for specialized equipment',
    resolution_plan: 'Source alternative supplier',
    owner_id: 'user-6',
    assigned_to: 'user-6',
    reported_by: 'user-6',
    created_at: now,
    updated_at: now,
  });

  decisions.set('decision-1', {
    id: 'decision-1',
    project_id: 'project-1',
    issue_id: 'issue-1',
    title: 'Equipment rental vs purchase',
    description: 'Decide whether to rent specialized equipment or purchase for rock excavation',
    decision_type: 'technical',
    decision_status: 'approved',
    decision_criteria: 'Cost, timeline, future use',
    options_considered: 'Rent equipment for 2 weeks, Purchase equipment, Subcontract to specialized company',
    chosen_option: 'Subcontract to specialized company',
    rationale: 'Most cost-effective and fastest solution',
    decision_maker: 'user-6',
    approval_required: false,
    created_by: 'user-6',
    created_at: now,
    updated_at: now,
  });

  actions.set('action-1', {
    id: 'action-1',
    project_id: 'project-1',
    decision_id: 'decision-1',
    issue_id: 'issue-1',
    title: 'Contact specialized excavation company',
    description: 'Research and contact companies that specialize in rock excavation',
    action_type: 'resolution',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'user-6',
    created_by: 'user-6',
    due_date: '2025-02-15',
    created_at: now,
    updated_at: now,
  });
}

seedData();

// =============================================
// HELPER
// =============================================

const probabilityScores: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const impactScores: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

let idCounter = Date.now();
function nextId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

function getByProject<T extends { project_id: string }>(store: Map<string, T>, projectId: string): T[] {
  return Array.from(store.values()).filter(item => item.project_id === projectId);
}

// =============================================
// RISK ROUTES
// =============================================

router.get("/api/projects/:projectId/risks", requireAuth, requireStaff, async (req, res) => {
  try {
    const projectRisks = getByProject(risks, req.params.projectId);
    res.json({ risks: projectRisks, total: projectRisks.length });
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
});

router.post("/api/projects/:projectId/risks", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const d = req.body;
    const probability = d.probability || 'medium';
    const impact = d.impact || 'medium';
    const now = new Date().toISOString();

    const newRisk: ProjectRisk = {
      id: nextId('risk'),
      project_id: projectId,
      title: d.title,
      description: d.description,
      category: d.category,
      probability,
      impact,
      risk_score: (probabilityScores[probability] || 2) * (impactScores[impact] || 2),
      status: d.status || 'identified',
      mitigation_strategy: d.mitigation_strategy,
      contingency_plan: d.contingency_plan,
      owner_id: d.owner_id,
      assigned_to: d.assigned_to,
      due_date: d.due_date,
      created_by: req.user!.id,
      created_at: now,
      updated_at: now,
    };

    risks.set(newRisk.id, newRisk);
    res.status(201).json(newRisk);
  } catch (error) {
    console.error('Error creating risk:', error);
    res.status(500).json({ error: 'Failed to create risk' });
  }
});

router.put("/api/risks/:riskId", requireAuth, requireStaff, async (req, res) => {
  try {
    const existing = risks.get(req.params.riskId);
    if (!existing) return res.status(404).json({ error: 'Risk not found' });

    const updated: ProjectRisk = { ...existing, ...req.body, updated_at: new Date().toISOString() };
    if (req.body.probability || req.body.impact) {
      updated.risk_score = (probabilityScores[updated.probability] || 2) * (impactScores[updated.impact] || 2);
    }
    risks.set(updated.id, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating risk:', error);
    res.status(500).json({ error: 'Failed to update risk' });
  }
});

router.post("/api/risks/:riskId/escalate", requireAuth, requireStaff, async (req, res) => {
  try {
    const risk = risks.get(req.params.riskId);
    if (!risk) return res.status(404).json({ error: 'Risk not found' });

    const now = new Date().toISOString();
    const d = req.body;

    // Create issue from risk
    const newIssue: ProjectIssue = {
      id: nextId('issue'),
      project_id: risk.project_id,
      risk_id: risk.id,
      title: d.title || risk.title,
      description: d.description || risk.description,
      category: risk.category,
      severity: d.severity || risk.impact as any,
      priority: d.priority || 'high',
      status: 'open',
      impact_description: d.impact_description,
      owner_id: risk.owner_id,
      assigned_to: risk.assigned_to,
      reported_by: req.user!.id,
      due_date: d.due_date,
      created_at: now,
      updated_at: now,
    };
    issues.set(newIssue.id, newIssue);

    // Update risk status
    risk.status = 'escalated';
    risk.escalated_to_issue_id = newIssue.id;
    risk.updated_at = now;
    risks.set(risk.id, risk);

    res.json({ risk, issue: newIssue });
  } catch (error) {
    console.error('Error escalating risk:', error);
    res.status(500).json({ error: 'Failed to escalate risk' });
  }
});

// =============================================
// ISSUE ROUTES
// =============================================

router.get("/api/projects/:projectId/issues", requireAuth, requireStaff, async (req, res) => {
  try {
    const projectIssues = getByProject(issues, req.params.projectId);
    res.json({ issues: projectIssues, total: projectIssues.length });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

router.post("/api/projects/:projectId/issues", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const d = req.body;
    const now = new Date().toISOString();

    const newIssue: ProjectIssue = {
      id: nextId('issue'),
      project_id: projectId,
      risk_id: d.risk_id,
      title: d.title,
      description: d.description,
      category: d.category,
      severity: d.severity || 'medium',
      priority: d.priority || 'medium',
      status: 'open',
      impact_description: d.impact_description,
      root_cause: d.root_cause,
      resolution_plan: d.resolution_plan,
      owner_id: d.owner_id,
      assigned_to: d.assigned_to,
      reported_by: req.user!.id,
      due_date: d.due_date,
      created_at: now,
      updated_at: now,
    };

    issues.set(newIssue.id, newIssue);
    res.status(201).json(newIssue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
});

router.put("/api/issues/:issueId", requireAuth, requireStaff, async (req, res) => {
  try {
    const existing = issues.get(req.params.issueId);
    if (!existing) return res.status(404).json({ error: 'Issue not found' });

    const updated: ProjectIssue = { ...existing, ...req.body, updated_at: new Date().toISOString() };
    if (req.body.status === 'resolved' && !updated.resolved_date) {
      updated.resolved_date = new Date().toISOString();
    }
    issues.set(updated.id, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ error: 'Failed to update issue' });
  }
});

// =============================================
// DECISION ROUTES
// =============================================

router.get("/api/projects/:projectId/decisions", requireAuth, requireStaff, async (req, res) => {
  try {
    const projectDecisions = getByProject(decisions, req.params.projectId);
    res.json({ decisions: projectDecisions, total: projectDecisions.length });
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

router.post("/api/projects/:projectId/decisions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const d = req.body;
    const now = new Date().toISOString();

    const newDecision: ProjectDecision = {
      id: nextId('decision'),
      project_id: projectId,
      issue_id: d.issue_id,
      title: d.title,
      description: d.description,
      decision_type: d.decision_type,
      decision_status: 'pending',
      decision_criteria: d.decision_criteria,
      options_considered: d.options_considered,
      chosen_option: d.chosen_option,
      rationale: d.rationale,
      decision_maker: d.decision_maker,
      stakeholders: d.stakeholders,
      approval_required: d.approval_required || false,
      implementation_deadline: d.implementation_deadline,
      created_by: req.user!.id,
      created_at: now,
      updated_at: now,
    };

    decisions.set(newDecision.id, newDecision);
    res.status(201).json(newDecision);
  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({ error: 'Failed to create decision' });
  }
});

router.put("/api/decisions/:decisionId", requireAuth, requireStaff, async (req, res) => {
  try {
    const existing = decisions.get(req.params.decisionId);
    if (!existing) return res.status(404).json({ error: 'Decision not found' });

    const now = new Date().toISOString();
    const updated: ProjectDecision = { ...existing, ...req.body, updated_at: now };
    if (req.body.decision_status === 'approved' && !updated.approved_at) {
      updated.approved_by = req.user!.id;
      updated.approved_at = now;
    }
    decisions.set(updated.id, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating decision:', error);
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

// =============================================
// ACTION ROUTES
// =============================================

router.get("/api/projects/:projectId/actions", requireAuth, requireStaff, async (req, res) => {
  try {
    const projectActions = getByProject(actions, req.params.projectId);
    res.json({ actions: projectActions, total: projectActions.length });
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Failed to fetch actions' });
  }
});

router.post("/api/projects/:projectId/actions", requireAuth, requireStaff, async (req, res) => {
  try {
    const { projectId } = req.params;
    const d = req.body;
    const now = new Date().toISOString();

    const newAction: ProjectAction = {
      id: nextId('action'),
      project_id: projectId,
      decision_id: d.decision_id,
      issue_id: d.issue_id,
      risk_id: d.risk_id,
      title: d.title,
      description: d.description,
      action_type: d.action_type,
      priority: d.priority || 'medium',
      status: 'pending',
      assigned_to: d.assigned_to,
      created_by: req.user!.id,
      due_date: d.due_date,
      created_at: now,
      updated_at: now,
    };

    actions.set(newAction.id, newAction);
    res.status(201).json(newAction);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ error: 'Failed to create action' });
  }
});

router.put("/api/actions/:actionId", requireAuth, requireStaff, async (req, res) => {
  try {
    const existing = actions.get(req.params.actionId);
    if (!existing) return res.status(404).json({ error: 'Action not found' });

    const now = new Date().toISOString();
    const updated: ProjectAction = { ...existing, ...req.body, updated_at: now };
    if (req.body.status === 'completed' && !updated.completed_date) {
      updated.completed_date = now;
    }
    actions.set(updated.id, updated);
    res.json(updated);
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ error: 'Failed to update action' });
  }
});

export default router;
