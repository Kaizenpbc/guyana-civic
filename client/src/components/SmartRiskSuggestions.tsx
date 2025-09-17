import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Lightbulb, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface RiskSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'environmental' | 'operational' | 'financial' | 'regulatory';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk_score: number;
  mitigation_strategy: string;
  contingency_plan: string;
  confidence: number; // AI confidence level (0-100)
  source: 'ai_analysis' | 'historical_data' | 'industry_standard';
}

interface SmartRiskSuggestionsProps {
  projectId: string;
  projectName: string;
  projectCategory: string;
  projectType: string;
  onAcceptSuggestion: (suggestion: RiskSuggestion) => void;
  onRejectSuggestion: (suggestionId: string) => void;
  onClose: () => void;
}

const SmartRiskSuggestions: React.FC<SmartRiskSuggestionsProps> = ({
  projectId,
  projectName,
  projectCategory,
  projectType,
  onAcceptSuggestion,
  onRejectSuggestion,
  onClose
}) => {
  const [suggestions, setSuggestions] = useState<RiskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<string>>(new Set());

  // AI-powered risk suggestion logic
  const generateRiskSuggestions = (category: string, type: string, projectName: string): RiskSuggestion[] => {
    const baseSuggestions: RiskSuggestion[] = [];

    // Building Construction Projects
    if (category === 'building_construction') {
      baseSuggestions.push(
        {
          id: 'weather-delays',
          title: 'Weather Delays',
          description: 'Construction delays due to adverse weather conditions, particularly during rainy season',
          category: 'environmental',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Schedule buffer time and use weather-resistant materials',
          contingency_plan: 'Extend project timeline and adjust resource allocation',
          confidence: 85,
          source: 'historical_data'
        },
        {
          id: 'material-shortages',
          title: 'Material Supply Shortages',
          description: 'Potential delays due to material availability and supply chain issues',
          category: 'operational',
          probability: 'medium',
          impact: 'high',
          risk_score: 6,
          mitigation_strategy: 'Secure material contracts early and maintain backup suppliers',
          contingency_plan: 'Source alternative materials or adjust construction sequence',
          confidence: 75,
          source: 'industry_standard'
        },
        {
          id: 'permits-delays',
          title: 'Permit and Approval Delays',
          description: 'Delays in obtaining necessary permits and regulatory approvals',
          category: 'regulatory',
          probability: 'medium',
          impact: 'medium',
          risk_score: 4,
          mitigation_strategy: 'Submit permit applications early and maintain regular follow-up',
          contingency_plan: 'Work with authorities to expedite approvals or adjust timeline',
          confidence: 80,
          source: 'ai_analysis'
        }
      );
    }

    // Road Construction Projects
    if (category === 'road_construction') {
      baseSuggestions.push(
        {
          id: 'traffic-disruption',
          title: 'Traffic Disruption',
          description: 'Public complaints and delays due to road closures and traffic management',
          category: 'operational',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Implement effective traffic management and public communication',
          contingency_plan: 'Adjust work hours and provide alternative routes',
          confidence: 90,
          source: 'historical_data'
        },
        {
          id: 'utility-conflicts',
          title: 'Utility Line Conflicts',
          description: 'Unexpected utility lines requiring relocation or protection',
          category: 'technical',
          probability: 'medium',
          impact: 'high',
          risk_score: 6,
          mitigation_strategy: 'Conduct thorough utility surveys before construction',
          contingency_plan: 'Coordinate with utility companies for relocation',
          confidence: 85,
          source: 'ai_analysis'
        }
      );
    }

    // School Construction Projects
    if (category === 'school_construction') {
      baseSuggestions.push(
        {
          id: 'safety-compliance',
          title: 'Safety Compliance Requirements',
          description: 'Strict safety standards and compliance requirements for educational facilities',
          category: 'regulatory',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Engage safety consultants early and maintain compliance documentation',
          contingency_plan: 'Adjust design and construction methods to meet requirements',
          confidence: 95,
          source: 'industry_standard'
        },
        {
          id: 'academic-calendar',
          title: 'Academic Calendar Constraints',
          description: 'Construction must be completed during school breaks to avoid disruption',
          category: 'operational',
          probability: 'medium',
          impact: 'high',
          risk_score: 6,
          mitigation_strategy: 'Plan construction phases around academic calendar',
          contingency_plan: 'Extend project timeline or work during extended breaks',
          confidence: 80,
          source: 'ai_analysis'
        }
      );
    }

    // Health Center Projects
    if (category === 'health_center') {
      baseSuggestions.push(
        {
          id: 'medical-equipment',
          title: 'Medical Equipment Installation',
          description: 'Complex installation requirements for medical equipment and systems',
          category: 'technical',
          probability: 'medium',
          impact: 'high',
          risk_score: 6,
          mitigation_strategy: 'Coordinate with equipment suppliers and specialized installers',
          contingency_plan: 'Adjust installation timeline and provide temporary facilities',
          confidence: 85,
          source: 'industry_standard'
        },
        {
          id: 'infection-control',
          title: 'Infection Control Requirements',
          description: 'Strict infection control and sterilization requirements for healthcare facilities',
          category: 'regulatory',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Design with infection control in mind and use appropriate materials',
          contingency_plan: 'Implement additional control measures and adjust design',
          confidence: 90,
          source: 'ai_analysis'
        }
      );
    }

    // Market Infrastructure Projects
    if (category === 'market_infrastructure') {
      baseSuggestions.push(
        {
          id: 'vendor-disruption',
          title: 'Vendor Business Disruption',
          description: 'Temporary closure affecting vendor businesses and local economy',
          category: 'operational',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Provide temporary facilities and maintain vendor communication',
          contingency_plan: 'Extend project timeline or provide compensation',
          confidence: 85,
          source: 'historical_data'
        },
        {
          id: 'sanitation-requirements',
          title: 'Sanitation and Hygiene Standards',
          description: 'High standards for sanitation, drainage, and waste management',
          category: 'regulatory',
          probability: 'medium',
          impact: 'medium',
          risk_score: 4,
          mitigation_strategy: 'Design with proper drainage and waste management systems',
          contingency_plan: 'Implement additional sanitation measures',
          confidence: 80,
          source: 'ai_analysis'
        }
      );
    }

    // Sports Complex Projects
    if (category === 'sports_complex' || 
        (category === 'infrastructure' && projectName && projectName.toLowerCase().includes('sports'))) {
      baseSuggestions.push(
        {
          id: 'field-conditions',
          title: 'Playing Field Conditions',
          description: 'Specific requirements for playing surfaces and field maintenance',
          category: 'technical',
          probability: 'medium',
          impact: 'high',
          risk_score: 6,
          mitigation_strategy: 'Engage sports field specialists and use appropriate materials',
          contingency_plan: 'Adjust field specifications or extend construction timeline',
          confidence: 85,
          source: 'industry_standard'
        },
        {
          id: 'safety-standards',
          title: 'Sports Safety Standards',
          description: 'Compliance with sports safety and equipment standards',
          category: 'regulatory',
          probability: 'high',
          impact: 'medium',
          risk_score: 6,
          mitigation_strategy: 'Follow international sports safety standards and guidelines',
          contingency_plan: 'Adjust design and equipment to meet safety requirements',
          confidence: 90,
          source: 'ai_analysis'
        }
      );
    }

    return baseSuggestions;
  };

  useEffect(() => {
    // Simulate AI processing time
    const timer = setTimeout(() => {
      const generatedSuggestions = generateRiskSuggestions(projectCategory, projectType, projectName);
      setSuggestions(generatedSuggestions);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [projectCategory, projectType]);

  const handleAcceptSuggestion = (suggestion: RiskSuggestion) => {
    setAcceptedSuggestions(prev => new Set([...prev, suggestion.id]));
    onAcceptSuggestion(suggestion);
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setRejectedSuggestions(prev => new Set([...prev, suggestionId]));
    onRejectSuggestion(suggestionId);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai_analysis': return <Lightbulb className="h-4 w-4" />;
      case 'historical_data': return <AlertTriangle className="h-4 w-4" />;
      case 'industry_standard': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI Risk Analysis in Progress...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Analyzing project characteristics...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Smart Risk Suggestions for {projectName}
          </CardTitle>
          <p className="text-sm text-gray-600">
            AI-powered risk analysis based on project type: <strong>{projectCategory}</strong>
          </p>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No specific risk suggestions available for this project type. 
                Consider adding general project risks manually.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion) => {
                const isAccepted = acceptedSuggestions.has(suggestion.id);
                const isRejected = rejectedSuggestions.has(suggestion.id);
                
                if (isRejected) return null;

                return (
                  <Card key={suggestion.id} className={`border-l-4 ${
                    isAccepted ? 'border-l-green-500 bg-green-50' : 'border-l-blue-500'
                  }`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{suggestion.title}</h4>
                            <Badge className={getConfidenceColor(suggestion.confidence)}>
                              {suggestion.confidence}% confidence
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getSourceIcon(suggestion.source)}
                              {suggestion.source.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{suggestion.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Mitigation Strategy:</h5>
                              <p className="text-sm text-gray-600">{suggestion.mitigation_strategy}</p>
                            </div>
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Contingency Plan:</h5>
                              <p className="text-sm text-gray-600">{suggestion.contingency_plan}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Risk Score:</span>
                              <Badge className={suggestion.risk_score >= 6 ? 'bg-red-100 text-red-800' : 
                                               suggestion.risk_score >= 4 ? 'bg-yellow-100 text-yellow-800' : 
                                               'bg-green-100 text-green-800'}>
                                {suggestion.risk_score}
                              </Badge>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Probability:</span>
                              <Badge variant="outline" className="capitalize">
                                {suggestion.probability}
                              </Badge>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">Impact:</span>
                              <Badge variant="outline" className="capitalize">
                                {suggestion.impact}
                              </Badge>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {!isAccepted && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptSuggestion(suggestion)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectSuggestion(suggestion.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {isAccepted && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue to Risk Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartRiskSuggestions;
