import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MapPin, 
  GraduationCap, 
  Shield, 
  Zap, 
  Building, 
  Wrench, 
  FileText, 
  Calendar,
  Users,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  phases: ProjectPhase[];
  documents: ProjectDocument[];
  estimatedDuration: string;
  description: string;
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  tasks: ProjectTask[];
  estimatedDays: number;
  dependencies?: string[];
}

interface ProjectTask {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  requiredSkills?: string[];
  deliverables?: string[];
  subtasks?: ProjectTask[];
}

interface ProjectDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  template?: string;
}

interface ProjectPlanningTemplatesProps {
  projectCategory: string;
  onTemplateSelect: (template: ProjectTemplate) => void;
  onClose: () => void;
  previouslySelectedPhases?: any[];
  previouslySelectedDocuments?: any[];
  isAddMode?: boolean; // True when adding phases to existing schedule
  existingTasks?: any[]; // Tasks already in the current schedule
}

const ProjectPlanningTemplates: React.FC<ProjectPlanningTemplatesProps> = ({ 
  projectCategory, 
  onTemplateSelect, 
  onClose,
  previouslySelectedPhases = [],
  previouslySelectedDocuments = [],
  isAddMode = false,
  existingTasks = []
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Initialize with previously selected phases and documents
  useEffect(() => {
    if (previouslySelectedPhases.length > 0) {
      const phaseIds = previouslySelectedPhases
        .filter(phase => phase.selected)
        .map(phase => phase.id);
      setSelectedPhases(phaseIds);
    }
    
    if (previouslySelectedDocuments.length > 0) {
      const documentIds = previouslySelectedDocuments
        .filter(doc => doc.selected)
        .map(doc => doc.id);
      setSelectedDocuments(documentIds);
    }
  }, [previouslySelectedPhases, previouslySelectedDocuments]);

  // Helper functions to check if items were previously selected
  const isPhasePreviouslySelected = (phaseId: string) => {
    return previouslySelectedPhases.some(phase => phase.id === phaseId && phase.selected);
  };

  const isDocumentPreviouslySelected = (documentId: string) => {
    return previouslySelectedDocuments.some(doc => doc.id === documentId && doc.selected);
  };

  // Helper functions for task-level visual indicators
  const getExistingTaskNames = () => {
    return existingTasks.map(task => task.name.toLowerCase());
  };

  const isTaskAlreadyInSchedule = (taskName: string) => {
    const existingNames = getExistingTaskNames();
    return existingNames.some(name => 
      name.includes(taskName.toLowerCase()) || 
      taskName.toLowerCase().includes(name)
    );
  };

  const getTaskStatus = (taskName: string) => {
    if (isTaskAlreadyInSchedule(taskName)) {
      return 'existing';
    }
    return 'new';
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'existing': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'new': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'existing': return '⚠️';
      case 'new': return '✨';
      default: return '📋';
    }
  };

  // Smart Templates for Guyana Infrastructure Projects
  const templates: ProjectTemplate[] = [
    {
      id: 'road-construction',
      name: 'Road Construction & Repair',
      icon: MapPin,
      description: 'Complete road construction, repair, and maintenance projects',
      estimatedDuration: '3-6 months',
      phases: [
        {
          id: 'initiation',
          name: 'Project Initiation',
          description: 'Initial project setup and stakeholder alignment',
          estimatedDays: 5,
          tasks: [
            { id: 't1', name: 'Project kickoff meeting', description: 'Meet with stakeholders and team', estimatedHours: 4 },
            { id: 't2', name: 'Site access coordination', description: 'Arrange site access and permits', estimatedHours: 8 },
            { id: 't3', name: 'Safety protocols setup', description: 'Establish safety procedures and equipment', estimatedHours: 6 }
          ]
        },
        {
          id: 'analysis',
          name: 'Site Analysis & Survey',
          description: 'Comprehensive site assessment and condition analysis',
          estimatedDays: 10,
          dependencies: ['initiation'],
          tasks: [
            { id: 't4', name: 'Road condition survey', description: 'Assess current road condition and damage', estimatedHours: 16 },
            { id: 't5', name: 'Traffic impact assessment', description: 'Analyze traffic patterns and impact', estimatedHours: 12 },
            { id: 't6', name: 'Drainage system evaluation', description: 'Check existing drainage and water flow', estimatedHours: 8 },
            { id: 't7', name: 'Utility mapping', description: 'Map underground utilities and conflicts', estimatedHours: 10 },
            { id: 't8', name: 'Environmental assessment', description: 'Evaluate environmental impact and requirements', estimatedHours: 6 }
          ]
        },
        {
          id: 'design',
          name: 'Design & Planning',
          description: 'Create detailed project design and specifications',
          estimatedDays: 15,
          dependencies: ['analysis'],
          tasks: [
            { id: 't9', name: 'Engineering design', description: 'Create detailed road design and specifications', estimatedHours: 24 },
            { id: 't10', name: 'Material specifications', description: 'Define required materials and quantities', estimatedHours: 8 },
            { id: 't11', name: 'Cost estimation', description: 'Calculate detailed project costs', estimatedHours: 12 },
            { id: 't12', name: 'Timeline development', description: 'Create detailed project schedule', estimatedHours: 8 }
          ]
        },
        {
          id: 'procurement',
          name: 'Procurement & Permits',
          description: 'Obtain materials, equipment, and necessary permits',
          estimatedDays: 20,
          dependencies: ['design'],
          tasks: [
            { id: 't13', name: 'Material procurement', description: 'Source and order required materials', estimatedHours: 16 },
            { id: 't14', name: 'Equipment rental', description: 'Arrange heavy equipment and machinery', estimatedHours: 8 },
            { id: 't15', name: 'Permit applications', description: 'Submit and obtain necessary permits', estimatedHours: 12 },
            { id: 't16', name: 'Contractor selection', description: 'Select and contract construction teams', estimatedHours: 16 }
          ]
        },
        {
          id: 'construction',
          name: 'Construction & Execution',
          description: 'Physical construction and implementation',
          estimatedDays: 45,
          dependencies: ['procurement'],
          tasks: [
            { id: 't17', name: 'Site preparation', description: 'Clear and prepare construction site', estimatedHours: 20 },
            { id: 't18', name: 'Excavation and grading', description: 'Excavate and grade road foundation', estimatedHours: 40 },
            { id: 't19', name: 'Base layer construction', description: 'Install road base materials', estimatedHours: 32 },
            { id: 't20', name: 'Surface layer application', description: 'Apply final road surface', estimatedHours: 24 },
            { id: 't21', name: 'Drainage installation', description: 'Install or repair drainage systems', estimatedHours: 16 },
            { id: 't22', name: 'Signage and markings', description: 'Install road signs and markings', estimatedHours: 8 }
          ]
        },
        {
          id: 'completion',
          name: 'Testing & Handover',
          description: 'Quality testing and project completion',
          estimatedDays: 5,
          dependencies: ['construction'],
          tasks: [
            { id: 't23', name: 'Quality testing', description: 'Test road quality and safety standards', estimatedHours: 8 },
            { id: 't24', name: 'Final inspection', description: 'Conduct final project inspection', estimatedHours: 4 },
            { id: 't25', name: 'Documentation completion', description: 'Complete all project documentation', estimatedHours: 6 },
            { id: 't26', name: 'Project handover', description: 'Hand over completed project to client', estimatedHours: 4 }
          ]
        }
      ],
      documents: [
        { id: 'd1', name: 'Site Survey Report', description: 'Detailed site condition assessment', required: true },
        { id: 'd2', name: 'Traffic Impact Study', description: 'Analysis of traffic impact during construction', required: true },
        { id: 'd3', name: 'Engineering Drawings', description: 'Detailed technical drawings and specifications', required: true },
        { id: 'd4', name: 'Material Test Reports', description: 'Quality test results for all materials', required: true },
        { id: 'd5', name: 'Safety Plan', description: 'Comprehensive safety procedures and protocols', required: true },
        { id: 'd6', name: 'Environmental Compliance', description: 'Environmental impact and compliance documentation', required: false },
        { id: 'd7', name: 'Progress Photos', description: 'Documentation photos throughout construction', required: false }
      ]
    },
    {
      id: 'school-construction',
      name: 'School Construction',
      icon: GraduationCap,
      description: 'Build new educational facilities or major renovations',
      estimatedDuration: '6-12 months',
      phases: [
        {
          id: 'initiation',
          name: 'Project Initiation',
          description: 'Initial project setup and stakeholder alignment',
          estimatedDays: 7,
          tasks: [
            { id: 't1', name: 'Stakeholder meeting', description: 'Meet with education officials and community', estimatedHours: 6 },
            { id: 't2', name: 'Site selection confirmation', description: 'Finalize and confirm school site location', estimatedHours: 4 },
            { id: 't3', name: 'Budget approval', description: 'Obtain final budget approval and funding', estimatedHours: 8 }
          ]
        },
        {
          id: 'design',
          name: 'Design & Planning',
          description: 'Create detailed school design and specifications',
          estimatedDays: 20,
          dependencies: ['initiation'],
          tasks: [
            { id: 't4', name: 'Architectural design', description: 'Create school building design and layout', estimatedHours: 40 },
            { id: 't5', name: 'Structural engineering', description: 'Design structural elements and foundation', estimatedHours: 24 },
            { id: 't6', name: 'Electrical design', description: 'Plan electrical systems and lighting', estimatedHours: 16 },
            { id: 't7', name: 'Plumbing design', description: 'Design water and sanitation systems', estimatedHours: 12 },
            { id: 't8', name: 'Accessibility compliance', description: 'Ensure ADA compliance and accessibility', estimatedHours: 8 }
          ]
        },
        {
          id: 'permits',
          name: 'Permits & Approvals',
          description: 'Obtain all necessary permits and approvals',
          estimatedDays: 30,
          dependencies: ['design'],
          tasks: [
            { id: 't9', name: 'Building permits', description: 'Submit and obtain building permits', estimatedHours: 16 },
            { id: 't10', name: 'Environmental permits', description: 'Obtain environmental impact permits', estimatedHours: 12 },
            { id: 't11', name: 'Utility connections', description: 'Arrange utility connections and approvals', estimatedHours: 8 },
            { id: 't12', name: 'Fire safety approval', description: 'Obtain fire safety and emergency system approval', estimatedHours: 6 }
          ]
        },
        {
          id: 'construction',
          name: 'Construction',
          description: 'Physical construction of school building',
          estimatedDays: 120,
          dependencies: ['permits'],
          tasks: [
            { id: 't13', name: 'Site preparation', description: 'Clear and prepare construction site', estimatedHours: 24 },
            { id: 't14', name: 'Foundation work', description: 'Excavate and pour foundation', estimatedHours: 48 },
            { id: 't15', name: 'Structural framework', description: 'Build structural framework and walls', estimatedHours: 80 },
            { id: 't16', name: 'Roofing', description: 'Install roof structure and covering', estimatedHours: 32 },
            { id: 't17', name: 'Electrical installation', description: 'Install electrical systems and fixtures', estimatedHours: 40 },
            { id: 't18', name: 'Plumbing installation', description: 'Install plumbing and sanitation systems', estimatedHours: 32 },
            { id: 't19', name: 'Interior finishing', description: 'Complete interior walls, floors, and fixtures', estimatedHours: 60 },
            { id: 't20', name: 'Exterior finishing', description: 'Complete exterior walls and landscaping', estimatedHours: 24 }
          ]
        },
        {
          id: 'completion',
          name: 'Testing & Handover',
          description: 'Final testing and project handover',
          estimatedDays: 10,
          dependencies: ['construction'],
          tasks: [
            { id: 't21', name: 'System testing', description: 'Test all electrical and plumbing systems', estimatedHours: 16 },
            { id: 't22', name: 'Safety inspection', description: 'Conduct comprehensive safety inspection', estimatedHours: 8 },
            { id: 't23', name: 'Final walkthrough', description: 'Final walkthrough with education officials', estimatedHours: 4 },
            { id: 't24', name: 'Documentation', description: 'Complete all project documentation and manuals', estimatedHours: 12 }
          ]
        }
      ],
      documents: [
        { id: 'd1', name: 'Architectural Drawings', description: 'Complete architectural design drawings', required: true },
        { id: 'd2', name: 'Structural Engineering Report', description: 'Structural analysis and design report', required: true },
        { id: 'd3', name: 'Building Permits', description: 'All required building and construction permits', required: true },
        { id: 'd4', name: 'Safety Inspection Report', description: 'Fire safety and emergency system inspection', required: true },
        { id: 'd5', name: 'Material Certificates', description: 'Quality certificates for all building materials', required: true },
        { id: 'd6', name: 'Accessibility Compliance', description: 'ADA compliance documentation and testing', required: true },
        { id: 'd7', name: 'Warranty Documentation', description: 'Warranties for all installed systems and materials', required: false }
      ]
    },
    {
      id: 'building-construction',
      name: 'Building Construction',
      icon: Building,
      description: 'Construct new buildings including community centers, offices, and public facilities',
      estimatedDuration: '4-8 months',
      phases: [
        {
          id: 'initiation',
          name: 'Project Initiation',
          description: 'Initial project setup and stakeholder alignment',
          estimatedDays: 7,
          tasks: [
            { 
              id: 't1', 
              name: 'Stakeholder meeting', 
              description: 'Meet with community leaders and officials', 
              estimatedHours: 6,
              subtasks: [
                { id: 't1-1', name: 'Schedule meeting', description: 'Coordinate meeting time with all stakeholders', estimatedHours: 1 },
                { id: 't1-2', name: 'Prepare agenda', description: 'Create meeting agenda and discussion points', estimatedHours: 2 },
                { id: 't1-3', name: 'Send invitations', description: 'Send meeting invitations and materials', estimatedHours: 1 },
                { id: 't1-4', name: 'Conduct meeting', description: 'Facilitate stakeholder meeting and discussions', estimatedHours: 2 }
              ]
            },
            { 
              id: 't2', 
              name: 'Site survey', 
              description: 'Conduct detailed site survey and assessment', 
              estimatedHours: 8,
              subtasks: [
                { id: 't2-1', name: 'Site access coordination', description: 'Arrange site access and permissions', estimatedHours: 1 },
                { id: 't2-2', name: 'Topographic survey', description: 'Conduct detailed topographic measurements', estimatedHours: 3 },
                { id: 't2-3', name: 'Soil testing', description: 'Collect and test soil samples', estimatedHours: 2 },
                { id: 't2-4', name: 'Utility mapping', description: 'Map existing utilities and infrastructure', estimatedHours: 2 }
              ]
            },
            { 
              id: 't3', 
              name: 'Budget confirmation', 
              description: 'Confirm final budget and funding sources', 
              estimatedHours: 4,
              subtasks: [
                { id: 't3-1', name: 'Review funding sources', description: 'Verify all funding sources and amounts', estimatedHours: 1 },
                { id: 't3-2', name: 'Cost breakdown analysis', description: 'Analyze detailed cost breakdown', estimatedHours: 2 },
                { id: 't3-3', name: 'Budget approval', description: 'Obtain final budget approval from authorities', estimatedHours: 1 }
              ]
            }
          ]
        },
        {
          id: 'design',
          name: 'Design & Planning',
          description: 'Create detailed building design and specifications',
          estimatedDays: 25,
          dependencies: ['initiation'],
          tasks: [
            { 
              id: 't4', 
              name: 'Architectural design', 
              description: 'Create building layout and architectural plans', 
              estimatedHours: 48,
              subtasks: [
                { id: 't4-1', name: 'Conceptual design', description: 'Develop initial building concept and layout', estimatedHours: 12 },
                { id: 't4-2', name: 'Schematic design', description: 'Create schematic drawings and floor plans', estimatedHours: 16 },
                { id: 't4-3', name: 'Design development', description: 'Refine design details and specifications', estimatedHours: 12 },
                { id: 't4-4', name: 'Construction documents', description: 'Prepare detailed construction drawings', estimatedHours: 8 }
              ]
            },
            { 
              id: 't5', 
              name: 'Structural engineering', 
              description: 'Design structural elements and foundation', 
              estimatedHours: 32,
              subtasks: [
                { id: 't5-1', name: 'Load analysis', description: 'Analyze structural loads and forces', estimatedHours: 8 },
                { id: 't5-2', name: 'Foundation design', description: 'Design foundation system and footings', estimatedHours: 10 },
                { id: 't5-3', name: 'Structural framing', description: 'Design structural frame and connections', estimatedHours: 10 },
                { id: 't5-4', name: 'Structural drawings', description: 'Prepare structural engineering drawings', estimatedHours: 4 }
              ]
            },
            { 
              id: 't6', 
              name: 'MEP design', 
              description: 'Design mechanical, electrical, and plumbing systems', 
              estimatedHours: 40,
              subtasks: [
                { id: 't6-1', name: 'Mechanical design', description: 'Design HVAC and mechanical systems', estimatedHours: 12 },
                { id: 't6-2', name: 'Electrical design', description: 'Design electrical systems and lighting', estimatedHours: 14 },
                { id: 't6-3', name: 'Plumbing design', description: 'Design plumbing and water systems', estimatedHours: 10 },
                { id: 't6-4', name: 'MEP coordination', description: 'Coordinate MEP systems integration', estimatedHours: 4 }
              ]
            },
            { 
              id: 't7', 
              name: 'Accessibility design', 
              description: 'Ensure accessibility compliance and features', 
              estimatedHours: 12,
              subtasks: [
                { id: 't7-1', name: 'ADA compliance review', description: 'Review design for ADA compliance', estimatedHours: 4 },
                { id: 't7-2', name: 'Accessibility features', description: 'Design accessibility features and accommodations', estimatedHours: 6 },
                { id: 't7-3', name: 'Compliance documentation', description: 'Prepare accessibility compliance documentation', estimatedHours: 2 }
              ]
            },
            { 
              id: 't8', 
              name: 'Interior design', 
              description: 'Plan interior spaces and finishes', 
              estimatedHours: 24,
              subtasks: [
                { id: 't8-1', name: 'Space planning', description: 'Plan interior space layout and flow', estimatedHours: 8 },
                { id: 't8-2', name: 'Material selection', description: 'Select interior finishes and materials', estimatedHours: 8 },
                { id: 't8-3', name: 'Furniture layout', description: 'Plan furniture placement and specifications', estimatedHours: 6 },
                { id: 't8-4', name: 'Interior drawings', description: 'Prepare interior design drawings', estimatedHours: 2 }
              ]
            }
          ]
        },
        {
          id: 'permits',
          name: 'Permits & Approvals',
          description: 'Obtain all necessary permits and approvals',
          estimatedDays: 35,
          dependencies: ['design'],
          tasks: [
            { id: 't9', name: 'Building permits', description: 'Submit and obtain building construction permits', estimatedHours: 20 },
            { id: 't10', name: 'Environmental permits', description: 'Obtain environmental impact and compliance permits', estimatedHours: 16 },
            { id: 't11', name: 'Utility approvals', description: 'Arrange utility connections and approvals', estimatedHours: 12 },
            { id: 't12', name: 'Fire safety approval', description: 'Obtain fire safety and emergency system approval', estimatedHours: 8 },
            { id: 't13', name: 'Zoning compliance', description: 'Ensure zoning compliance and approvals', estimatedHours: 6 }
          ]
        },
        {
          id: 'procurement',
          name: 'Procurement & Setup',
          description: 'Source materials and prepare construction site',
          estimatedDays: 20,
          dependencies: ['permits'],
          tasks: [
            { id: 't14', name: 'Material procurement', description: 'Source and order building materials', estimatedHours: 24 },
            { id: 't15', name: 'Equipment rental', description: 'Arrange construction equipment and machinery', estimatedHours: 12 },
            { id: 't16', name: 'Contractor selection', description: 'Select and contract construction teams', estimatedHours: 20 },
            { id: 't17', name: 'Site preparation', description: 'Prepare construction site and access', estimatedHours: 16 }
          ]
        },
        {
          id: 'construction',
          name: 'Construction',
          description: 'Physical construction of the building',
          estimatedDays: 90,
          dependencies: ['procurement'],
          tasks: [
            { id: 't18', name: 'Foundation work', description: 'Excavate and pour building foundation', estimatedHours: 60 },
            { id: 't19', name: 'Structural framework', description: 'Build structural framework and walls', estimatedHours: 100 },
            { id: 't20', name: 'Roofing', description: 'Install roof structure and covering', estimatedHours: 40 },
            { id: 't21', name: 'MEP installation', description: 'Install mechanical, electrical, and plumbing systems', estimatedHours: 80 },
            { id: 't22', name: 'Interior construction', description: 'Complete interior walls, floors, and fixtures', estimatedHours: 80 },
            { id: 't23', name: 'Exterior finishing', description: 'Complete exterior walls, windows, and doors', estimatedHours: 40 },
            { id: 't24', name: 'Landscaping', description: 'Complete exterior landscaping and parking', estimatedHours: 24 }
          ]
        },
        {
          id: 'completion',
          name: 'Testing & Handover',
          description: 'Final testing and project handover',
          estimatedDays: 12,
          dependencies: ['construction'],
          tasks: [
            { id: 't25', name: 'System testing', description: 'Test all building systems and equipment', estimatedHours: 20 },
            { id: 't26', name: 'Safety inspection', description: 'Conduct comprehensive safety and code inspection', estimatedHours: 8 },
            { id: 't27', name: 'Final walkthrough', description: 'Final walkthrough with stakeholders', estimatedHours: 6 },
            { id: 't28', name: 'Documentation', description: 'Complete all project documentation and manuals', estimatedHours: 16 },
            { id: 't29', name: 'Training', description: 'Provide building operation and maintenance training', estimatedHours: 8 }
          ]
        }
      ],
      documents: [
        { id: 'd1', name: 'Architectural Drawings', description: 'Complete architectural design and layout drawings', required: true },
        { id: 'd2', name: 'Structural Engineering Report', description: 'Structural analysis and design calculations', required: true },
        { id: 'd3', name: 'MEP Design Plans', description: 'Mechanical, electrical, and plumbing system designs', required: true },
        { id: 'd4', name: 'Building Permits', description: 'All required building and construction permits', required: true },
        { id: 'd5', name: 'Safety Inspection Report', description: 'Fire safety and emergency system inspection', required: true },
        { id: 'd6', name: 'Material Certificates', description: 'Quality certificates for all building materials', required: true },
        { id: 'd7', name: 'Accessibility Compliance', description: 'Accessibility compliance documentation and testing', required: true },
        { id: 'd8', name: 'Warranty Documentation', description: 'Warranties for all installed systems and materials', required: false },
        { id: 'd9', name: 'Operation Manual', description: 'Building operation and maintenance manual', required: false }
      ]
    },
    {
      id: 'seawall-repair',
      name: 'Seawall Repair & Construction',
      icon: Shield,
      description: 'Repair or construct coastal protection structures',
      estimatedDuration: '2-4 months',
      phases: [
        {
          id: 'initiation',
          name: 'Project Initiation',
          description: 'Initial project setup and coastal assessment',
          estimatedDays: 5,
          tasks: [
            { id: 't1', name: 'Coastal assessment', description: 'Assess current seawall condition and erosion', estimatedHours: 8 },
            { id: 't2', name: 'Tidal analysis', description: 'Analyze tidal patterns and sea level impact', estimatedHours: 6 },
            { id: 't3', name: 'Weather window planning', description: 'Plan construction around weather conditions', estimatedHours: 4 }
          ]
        },
        {
          id: 'design',
          name: 'Design & Engineering',
          description: 'Create seawall design and engineering specifications',
          estimatedDays: 12,
          dependencies: ['initiation'],
          tasks: [
            { id: 't4', name: 'Structural design', description: 'Design seawall structure and materials', estimatedHours: 20 },
            { id: 't5', name: 'Wave impact analysis', description: 'Analyze wave forces and impact resistance', estimatedHours: 12 },
            { id: 't6', name: 'Foundation design', description: 'Design foundation and anchoring system', estimatedHours: 16 },
            { id: 't7', name: 'Material selection', description: 'Select appropriate construction materials', estimatedHours: 8 }
          ]
        },
        {
          id: 'procurement',
          name: 'Material Procurement',
          description: 'Source and prepare construction materials',
          estimatedDays: 15,
          dependencies: ['design'],
          tasks: [
            { id: 't8', name: 'Material sourcing', description: 'Source concrete, steel, and protective materials', estimatedHours: 12 },
            { id: 't9', name: 'Equipment rental', description: 'Arrange specialized marine construction equipment', estimatedHours: 8 },
            { id: 't10', name: 'Transport coordination', description: 'Coordinate material transport to coastal site', estimatedHours: 6 }
          ]
        },
        {
          id: 'construction',
          name: 'Construction',
          description: 'Physical construction of seawall structure',
          estimatedDays: 35,
          dependencies: ['procurement'],
          tasks: [
            { id: 't11', name: 'Site preparation', description: 'Prepare construction site and access', estimatedHours: 16 },
            { id: 't12', name: 'Foundation work', description: 'Excavate and construct foundation', estimatedHours: 40 },
            { id: 't13', name: 'Wall construction', description: 'Build seawall structure and core', estimatedHours: 60 },
            { id: 't14', name: 'Protective facing', description: 'Install protective facing and armor units', estimatedHours: 32 },
            { id: 't15', name: 'Drainage installation', description: 'Install drainage and water management systems', estimatedHours: 16 }
          ]
        },
        {
          id: 'completion',
          name: 'Testing & Handover',
          description: 'Final testing and project completion',
          estimatedDays: 5,
          dependencies: ['construction'],
          tasks: [
            { id: 't16', name: 'Structural testing', description: 'Test seawall structural integrity', estimatedHours: 8 },
            { id: 't17', name: 'Final inspection', description: 'Conduct final project inspection', estimatedHours: 4 },
            { id: 't18', name: 'Documentation', description: 'Complete project documentation and maintenance guide', estimatedHours: 6 }
          ]
        }
      ],
      documents: [
        { id: 'd1', name: 'Coastal Assessment Report', description: 'Detailed coastal condition and erosion analysis', required: true },
        { id: 'd2', name: 'Tidal Analysis Report', description: 'Tidal patterns and sea level impact study', required: true },
        { id: 'd3', name: 'Structural Engineering Report', description: 'Seawall structural design and analysis', required: true },
        { id: 'd4', name: 'Environmental Impact Assessment', description: 'Environmental impact and mitigation measures', required: true },
        { id: 'd5', name: 'Material Test Reports', description: 'Quality test results for all construction materials', required: true },
        { id: 'd6', name: 'Safety Plan', description: 'Marine construction safety procedures', required: true },
        { id: 'd7', name: 'Maintenance Manual', description: 'Long-term maintenance and monitoring guide', required: false }
      ]
    }
  ];

  const getTemplateForCategory = (category: string): ProjectTemplate | null => {
    const categoryMap: { [key: string]: string } = {
      'infrastructure': 'building-construction',
      'education': 'school-construction',
      'environment': 'seawall-repair'
    };
    
    const templateId = categoryMap[category.toLowerCase()];
    return templates.find(t => t.id === templateId) || null;
  };

  const template = getTemplateForCategory(projectCategory);

  if (!template) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Template Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No smart template is available for "{projectCategory}" projects yet.
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handlePhaseToggle = (phaseId: string) => {
    setSelectedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleGenerateSchedule = () => {
    const selectedTemplateData = {
      ...template,
      selectedPhases: template.phases.filter(phase => selectedPhases.includes(phase.id)),
      selectedDocuments: template.documents.filter(doc => selectedDocuments.includes(doc.id))
    };
    onTemplateSelect(selectedTemplateData);
  };

  const TemplateIcon = template.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TemplateIcon className="h-6 w-6" />
            {template.name}
          </CardTitle>
          <p className="text-muted-foreground">{template.description}</p>
          <div className="flex gap-2">
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {template.estimatedDuration}
            </Badge>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {template.phases.length} Phases
            </Badge>
            <Badge variant="outline">
              <FileText className="h-3 w-3 mr-1" />
              {template.documents.length} Documents
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Smart Suggestions for Add Mode */}
      {isAddMode && existingTasks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-amber-700">
                You already have <strong>{existingTasks.length} tasks</strong> in your schedule. 
                Adding new phases may include similar tasks.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600">⚠️</span>
                    <span className="font-medium text-sm">Existing Tasks</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {existingTasks.slice(0, 3).map((task, index) => (
                      <div key={index}>• {task.name}</div>
                    ))}
                    {existingTasks.length > 3 && (
                      <div>• +{existingTasks.length - 3} more...</div>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-white rounded border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">💡</span>
                    <span className="font-medium text-sm">Smart Tips</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Similar tasks will be highlighted</div>
                    <div>• You can still add phases with duplicate tasks</div>
                    <div>• Consider if you need the same task in multiple phases</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Phases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Phases
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the phases you want to include in your project schedule
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {template.phases.map((phase) => (
                <div key={phase.id} className={`border rounded-lg p-4 ${isPhasePreviouslySelected(phase.id) ? 'bg-gray-50 opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={phase.id}
                      checked={selectedPhases.includes(phase.id)}
                      onCheckedChange={() => handlePhaseToggle(phase.id)}
                      disabled={isPhasePreviouslySelected(phase.id)}
                    />
                    <div className="flex-1">
                      <label htmlFor={phase.id} className="font-medium cursor-pointer">
                        {phase.name}
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {phase.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {phase.estimatedDays} days
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {phase.tasks.length} tasks
                        </span>
                        {isAddMode && (
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {phase.tasks.filter(task => isTaskAlreadyInSchedule(task.name)).length} already in schedule
                          </span>
                        )}
                      </div>
                      
                      {/* Task-level visual indicators */}
                      {isAddMode && phase.tasks.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">Tasks in this phase:</div>
                          <div className="grid grid-cols-1 gap-1">
                            {phase.tasks.slice(0, 3).map((task) => {
                              const status = getTaskStatus(task.name);
                              return (
                                <div key={task.id} className={`text-xs px-2 py-1 rounded border ${getTaskStatusColor(status)}`}>
                                  <span className="mr-1">{getTaskStatusIcon(status)}</span>
                                  {task.name}
                                  {status === 'existing' && (
                                    <span className="ml-1 text-xs opacity-75">(already added)</span>
                                  )}
                                </div>
                              );
                            })}
                            {phase.tasks.length > 3 && (
                              <div className="text-xs text-muted-foreground px-2">
                                +{phase.tasks.length - 3} more tasks...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Required Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the documents you need to prepare for this project
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {template.documents.map((doc) => (
                <div key={doc.id} className={`flex items-start gap-3 p-3 border rounded-lg ${isDocumentPreviouslySelected(doc.id) ? 'bg-gray-50 opacity-60' : ''}`}>
                  <Checkbox
                    id={doc.id}
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => handleDocumentToggle(doc.id)}
                    disabled={isDocumentPreviouslySelected(doc.id)}
                  />
                  <div className="flex-1">
                    <label htmlFor={doc.id} className="font-medium cursor-pointer flex items-center gap-2">
                      {doc.name}
                      {doc.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleGenerateSchedule}
          disabled={selectedPhases.length === 0}
        >
          {isAddMode ? 'Add Selected Phases' : 'Generate Project Schedule'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectPlanningTemplates;
