import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Lightbulb, CheckCircle, X } from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  type: 'risk_title' | 'mitigation_strategy' | 'contingency_plan' | 'description';
  confidence: number;
  source: 'ai_analysis' | 'historical_data' | 'industry_standard';
  category?: string;
}

interface SmartAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  fieldType: 'risk_title' | 'mitigation_strategy' | 'contingency_plan' | 'description';
  projectCategory?: string;
  className?: string;
}

const SmartAutoComplete: React.FC<SmartAutoCompleteProps> = ({
  value,
  onChange,
  placeholder,
  fieldType,
  projectCategory = 'infrastructure',
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate smart suggestions based on field type and project category
  const generateSuggestions = (input: string, fieldType: string, projectCategory: string): Suggestion[] => {
    if (input.length < 2) return [];

    const baseSuggestions: Suggestion[] = [];
    
    // Debug logging
    console.log('SmartAutoComplete Debug:', { input, fieldType, projectCategory });

    // Risk Title Suggestions
    if (fieldType === 'risk_title') {
      // Always show some basic suggestions for any project type
      baseSuggestions.push(
        {
          id: 'weather-delays',
          text: 'Weather Delays and Seasonal Impact',
          type: 'risk_title',
          confidence: 90,
          source: 'historical_data',
          category: 'environmental'
        },
        {
          id: 'material-shortages',
          text: 'Material Supply Chain Disruptions',
          type: 'risk_title',
          confidence: 85,
          source: 'industry_standard',
          category: 'operational'
        },
        {
          id: 'safety-compliance',
          text: 'Safety and Compliance Requirements',
          type: 'risk_title',
          confidence: 95,
          source: 'ai_analysis',
          category: 'regulatory'
        },
        {
          id: 'test-suggestion',
          text: 'Test Risk Suggestion - Should Always Appear',
          type: 'risk_title',
          confidence: 100,
          source: 'ai_analysis',
          category: 'test'
        }
      );

      // Add project-specific suggestions
      if (projectCategory === 'infrastructure' || projectCategory.includes('sports') || projectCategory === 'building_construction') {
        baseSuggestions.push(
          {
            id: 'field-conditions',
            text: 'Playing Field Surface and Maintenance',
            type: 'risk_title',
            confidence: 90,
            source: 'historical_data',
            category: 'environmental'
          },
          {
            id: 'material-shortages',
            text: 'Material Supply Chain Disruptions',
            type: 'risk_title',
            confidence: 85,
            source: 'industry_standard',
            category: 'operational'
          },
          {
            id: 'safety-compliance',
            text: 'Safety and Compliance Requirements',
            type: 'risk_title',
            confidence: 95,
            source: 'ai_analysis',
            category: 'regulatory'
          }
        );
      }

      if (projectCategory.includes('sports')) {
        baseSuggestions.push(
          {
            id: 'field-conditions',
            text: 'Playing Field Surface and Maintenance',
            type: 'risk_title',
            confidence: 88,
            source: 'industry_standard',
            category: 'technical'
          },
          {
            id: 'equipment-safety',
            text: 'Sports Equipment Safety Standards',
            type: 'risk_title',
            confidence: 92,
            source: 'ai_analysis',
            category: 'regulatory'
          }
        );
      }

      if (projectCategory.includes('health') || projectCategory.includes('medical')) {
        baseSuggestions.push(
          {
            id: 'infection-control',
            text: 'Infection Control and Sterilization',
            type: 'risk_title',
            confidence: 95,
            source: 'industry_standard',
            category: 'regulatory'
          },
          {
            id: 'medical-equipment',
            text: 'Medical Equipment Installation and Calibration',
            type: 'risk_title',
            confidence: 87,
            source: 'ai_analysis',
            category: 'technical'
          }
        );
      }
    }

    // Mitigation Strategy Suggestions
    if (fieldType === 'mitigation_strategy') {
      baseSuggestions.push(
        {
          id: 'early-planning',
          text: 'Implement early planning and stakeholder engagement',
          type: 'mitigation_strategy',
          confidence: 85,
          source: 'ai_analysis'
        },
        {
          id: 'backup-suppliers',
          text: 'Establish backup suppliers and alternative procurement channels',
          type: 'mitigation_strategy',
          confidence: 80,
          source: 'historical_data'
        },
        {
          id: 'regular-monitoring',
          text: 'Conduct regular monitoring and progress reviews',
          type: 'mitigation_strategy',
          confidence: 88,
          source: 'industry_standard'
        },
        {
          id: 'expert-consultation',
          text: 'Engage subject matter experts and specialized consultants',
          type: 'mitigation_strategy',
          confidence: 90,
          source: 'ai_analysis'
        }
      );
    }

    // Contingency Plan Suggestions
    if (fieldType === 'contingency_plan') {
      baseSuggestions.push(
        {
          id: 'timeline-extension',
          text: 'Extend project timeline and adjust resource allocation',
          type: 'contingency_plan',
          confidence: 85,
          source: 'historical_data'
        },
        {
          id: 'alternative-approach',
          text: 'Implement alternative approach or design modification',
          type: 'contingency_plan',
          confidence: 82,
          source: 'ai_analysis'
        },
        {
          id: 'escalation-process',
          text: 'Activate escalation process and stakeholder notification',
          type: 'contingency_plan',
          confidence: 88,
          source: 'industry_standard'
        },
        {
          id: 'additional-resources',
          text: 'Deploy additional resources and specialized teams',
          type: 'contingency_plan',
          confidence: 80,
          source: 'ai_analysis'
        }
      );
    }

    // Description Suggestions
    if (fieldType === 'description') {
      baseSuggestions.push(
        {
          id: 'detailed-impact',
          text: 'This risk could significantly impact project timeline, budget, and quality if not properly managed.',
          type: 'description',
          confidence: 75,
          source: 'ai_analysis'
        },
        {
          id: 'stakeholder-impact',
          text: 'Potential impact on key stakeholders and project deliverables requiring immediate attention.',
          type: 'description',
          confidence: 78,
          source: 'historical_data'
        }
      );
    }

    // Filter suggestions based on input
    return baseSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('SmartAutoComplete Input Change:', { newValue, length: newValue.length });
    onChange(newValue);

    if (newValue.length >= 2) {
      setIsLoading(true);
      console.log('SmartAutoComplete: Generating suggestions...');
      // Simulate AI processing time
      setTimeout(() => {
        const newSuggestions = generateSuggestions(newValue, fieldType, projectCategory);
        console.log('SmartAutoComplete: Generated suggestions:', newSuggestions);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
        setIsLoading(false);
      }, 300);
    } else {
      console.log('SmartAutoComplete: Input too short, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 80) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai_analysis': return <Lightbulb className="h-3 w-3" />;
      case 'historical_data': return <CheckCircle className="h-3 w-3" />;
      case 'industry_standard': return <CheckCircle className="h-3 w-3" />;
      default: return <Lightbulb className="h-3 w-3" />;
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={`${placeholder} (AI-powered)`}
        className={`${className} ${isLoading ? 'pr-8' : ''}`}
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {suggestion.text}
                  </p>
                  {suggestion.category && (
                    <Badge variant="outline" className="text-xs mb-2">
                      {suggestion.category}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence}%
                  </Badge>
                  <div className="flex items-center text-gray-400">
                    {getSourceIcon(suggestion.source)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              AI-powered suggestions • Use ↑↓ to navigate • Enter to select • Esc to close
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAutoComplete;
