import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface EscalationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    timeThreshold: number; // hours
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  actions: {
    notifyPM: boolean;
    notifyStakeholders: boolean;
    autoAssign: boolean;
    createAction: boolean;
  };
  escalationLevel: 'pm' | 'stakeholder' | 'management' | 'executive';
}

interface EscalatedIssue {
  id: string;
  issueId: string;
  issueTitle: string;
  projectId: string;
  projectName: string;
  originalSeverity: 'low' | 'medium' | 'high' | 'critical';
  escalationReason: string;
  escalatedAt: string;
  escalationLevel: 'pm' | 'stakeholder' | 'management' | 'executive';
  status: 'pending' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  actions: string[];
}

interface SmartIssueEscalationProps {
  projectId?: string;
  onEscalationCreated?: (escalation: EscalatedIssue) => void;
}

const SmartIssueEscalation: React.FC<SmartIssueEscalationProps> = ({
  projectId,
  onEscalationCreated
}) => {
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [escalatedIssues, setEscalatedIssues] = useState<EscalatedIssue[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Default escalation rules
  const defaultRules: EscalationRule[] = [
    {
      id: 'critical-24h',
      name: 'Critical Issue - 24 Hour Rule',
      description: 'Critical issues must be escalated if not resolved within 24 hours',
      conditions: {
        severity: 'critical',
        timeThreshold: 24,
        priority: 'critical'
      },
      actions: {
        notifyPM: true,
        notifyStakeholders: true,
        autoAssign: true,
        createAction: true
      },
      escalationLevel: 'management'
    },
    {
      id: 'high-48h',
      name: 'High Issue - 48 Hour Rule',
      description: 'High severity issues must be escalated if not resolved within 48 hours',
      conditions: {
        severity: 'high',
        timeThreshold: 48,
        priority: 'high'
      },
      actions: {
        notifyPM: true,
        notifyStakeholders: true,
        autoAssign: false,
        createAction: true
      },
      escalationLevel: 'stakeholder'
    },
    {
      id: 'medium-72h',
      name: 'Medium Issue - 72 Hour Rule',
      description: 'Medium severity issues must be escalated if not resolved within 72 hours',
      conditions: {
        severity: 'medium',
        timeThreshold: 72,
        priority: 'medium'
      },
      actions: {
        notifyPM: true,
        notifyStakeholders: false,
        autoAssign: false,
        createAction: false
      },
      escalationLevel: 'pm'
    }
  ];

  useEffect(() => {
    setEscalationRules(defaultRules);
    loadEscalatedIssues();
  }, [projectId]);

  const loadEscalatedIssues = async () => {
    // Mock data for demonstration
    const mockEscalatedIssues: EscalatedIssue[] = [
      {
        id: 'esc-1',
        issueId: 'issue-1',
        issueTitle: 'Critical Safety Issue - Construction Site',
        projectId: 'proj-pm-4',
        projectName: 'Anna Regina Sports Complex',
        originalSeverity: 'critical',
        escalationReason: 'Issue has been open for 25 hours without resolution',
        escalatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        escalationLevel: 'management',
        status: 'pending',
        assignedTo: 'Regional Manager',
        actions: ['Notify Regional Manager', 'Create Emergency Action Item', 'Schedule Emergency Meeting']
      },
      {
        id: 'esc-2',
        issueId: 'issue-2',
        issueTitle: 'Budget Overrun Risk',
        projectId: 'proj-pm-1',
        projectName: 'Essequibo Coast School Renovation',
        originalSeverity: 'high',
        escalationReason: 'Issue has been open for 50 hours without resolution',
        escalatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        escalationLevel: 'stakeholder',
        status: 'acknowledged',
        assignedTo: 'Finance Manager',
        actions: ['Notify Finance Team', 'Create Budget Review Action']
      }
    ];
    setEscalatedIssues(mockEscalatedIssues);
  };

  const analyzeIssuesForEscalation = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    const newEscalations: EscalatedIssue[] = [
      {
        id: `esc-${Date.now()}`,
        issueId: 'issue-3',
        issueTitle: 'Material Delivery Delay',
        projectId: 'proj-pm-2',
        projectName: 'Pomeroon Health Center Upgrade',
        originalSeverity: 'medium',
        escalationReason: 'Issue has been open for 75 hours without resolution',
        escalatedAt: new Date().toISOString(),
        escalationLevel: 'pm',
        status: 'pending',
        assignedTo: 'Project Manager',
        actions: ['Notify Project Manager', 'Create Follow-up Action']
      }
    ];

    setEscalatedIssues(prev => [...newEscalations, ...prev]);
    
    // Notify parent component
    newEscalations.forEach(escalation => {
      onEscalationCreated?.(escalation);
    });

    setIsAnalyzing(false);
  };

  const acknowledgeEscalation = (escalationId: string) => {
    setEscalatedIssues(prev => 
      prev.map(esc => 
        esc.id === escalationId 
          ? { ...esc, status: 'acknowledged' as const }
          : esc
      )
    );
  };

  const resolveEscalation = (escalationId: string) => {
    setEscalatedIssues(prev => 
      prev.map(esc => 
        esc.id === escalationId 
          ? { ...esc, status: 'resolved' as const }
          : esc
      )
    );
  };

  const getEscalationLevelColor = (level: string) => {
    switch (level) {
      case 'pm': return 'bg-blue-100 text-blue-800';
      case 'stakeholder': return 'bg-yellow-100 text-yellow-800';
      case 'management': return 'bg-orange-100 text-orange-800';
      case 'executive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Issue Escalation</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? 'Hide Rules' : 'View Rules'}
          </Button>
          <Button
            onClick={analyzeIssuesForEscalation}
            disabled={isAnalyzing}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Analyze Issues
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Escalation Rules */}
      {showRules && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span>Escalation Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escalationRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <Badge className={getSeverityColor(rule.conditions.severity)}>
                      {rule.conditions.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Time Threshold:</span> {rule.conditions.timeThreshold}h
                    </div>
                    <div>
                      <span className="font-medium">Escalation Level:</span> {rule.escalationLevel}
                    </div>
                    <div>
                      <span className="font-medium">Notify PM:</span> {rule.actions.notifyPM ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Auto Assign:</span> {rule.actions.autoAssign ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Escalated Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Escalated Issues ({escalatedIssues.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {escalatedIssues.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No issues currently require escalation. All issues are being handled within acceptable timeframes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {escalatedIssues.map((escalation) => (
                <div key={escalation.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{escalation.issueTitle}</h4>
                        <Badge className={getSeverityColor(escalation.originalSeverity)}>
                          {escalation.originalSeverity.toUpperCase()}
                        </Badge>
                        <Badge className={getEscalationLevelColor(escalation.escalationLevel)}>
                          {escalation.escalationLevel.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(escalation.status)}>
                          {escalation.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Project:</strong> {escalation.projectName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Reason:</strong> {escalation.escalationReason}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Assigned To:</strong> {escalation.assignedTo || 'Unassigned'}
                      </p>
                      <p className="text-sm text-gray-500">
                        <strong>Escalated:</strong> {new Date(escalation.escalatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {escalation.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeEscalation(escalation.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {escalation.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          onClick={() => resolveEscalation(escalation.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Taken */}
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Actions Taken:</h5>
                    <div className="flex flex-wrap gap-2">
                      {escalation.actions.map((action, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">
                  {escalatedIssues.filter(e => e.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {escalatedIssues.filter(e => e.status === 'acknowledged').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {escalatedIssues.filter(e => e.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rules</p>
                <p className="text-2xl font-bold text-blue-600">{escalationRules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartIssueEscalation;