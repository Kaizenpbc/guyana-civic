import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  RefreshCw,
  Target,
  Clock,
  Zap
} from 'lucide-react';

interface PredictiveData {
  projectId: string;
  currentProgress: number;
  plannedCompletionDate: string;
  predictedCompletionDate: string;
  confidence: number;
  daysRemaining: number;
  velocity: string;
  riskMultiplier: string;
  factors: {
    progressVelocity: string;
    riskLevel: string;
    projectMaturity: string;
  };
  explanation: string[];
  recommendations: string[];
}

interface PredictiveCompletionCardProps {
  projectId: string;
}

const PredictiveCompletionCard: React.FC<PredictiveCompletionCardProps> = ({ projectId }) => {
  const [prediction, setPrediction] = useState<PredictiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, this would be an API call
      // For now, we'll simulate the prediction data
      const mockData: PredictiveData = {
        projectId,
        currentProgress: 45,
        plannedCompletionDate: "2024-12-31T00:00:00.000Z",
        predictedCompletionDate: "2025-01-15T00:00:00.000Z",
        confidence: 78,
        daysRemaining: 45,
        velocity: "0.85",
        riskMultiplier: "1.15",
        factors: {
          progressVelocity: "Moderate",
          riskLevel: "Medium",
          projectMaturity: "Mid-stage"
        },
        explanation: [
          "Infrastructure project with additional complexity",
          "Moderate progress velocity detected",
          "Risk factors may cause minor delays"
        ],
        recommendations: [
          "Monitor progress velocity weekly",
          "Focus on risk mitigation for construction delays"
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPrediction(mockData);
    } catch (err) {
      setError('Failed to load prediction data');
      console.error('Prediction fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [projectId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getVelocityIcon = (velocity: string) => {
    switch (velocity) {
      case 'Good': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'Moderate': return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default: return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Analyzing project data...</span>
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
                onClick={fetchPrediction}
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

  if (!prediction) {
    return null;
  }

  const plannedDate = new Date(prediction.plannedCompletionDate);
  const predictedDate = new Date(prediction.predictedCompletionDate);
  const isDelayed = predictedDate > plannedDate;
  const daysDifference = Math.abs(Math.ceil((predictedDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span>AI Completion Prediction</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getConfidenceColor(prediction.confidence)}>
              {prediction.confidence}% Confidence
            </Badge>
            <Button variant="outline" size="sm" onClick={fetchPrediction}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Prediction */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Planned Completion</span>
            </div>
            <div className="text-lg font-semibold">
              {plannedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>Predicted Completion</span>
            </div>
            <div className={`text-lg font-semibold flex items-center space-x-2 ${
              isDelayed ? 'text-red-600' : 'text-green-600'
            }`}>
              {predictedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              {isDelayed ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            {isDelayed && (
              <div className="text-sm text-red-600">
                {daysDifference} days delay
              </div>
            )}
          </div>
        </div>

        {/* Progress and Time Remaining */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Current Progress</span>
              <span className="text-sm text-gray-600">{prediction.currentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${prediction.currentProgress}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {prediction.daysRemaining} days remaining
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Velocity: {prediction.velocity}% per day
            </div>
          </div>
        </div>

        {/* Key Factors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              {getVelocityIcon(prediction.factors.progressVelocity)}
            </div>
            <div className="text-sm font-medium text-gray-900">Progress Velocity</div>
            <div className="text-xs text-gray-600">{prediction.factors.progressVelocity}</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-1">Risk Level</div>
            <Badge className={getRiskColor(prediction.factors.riskLevel)}>
              {prediction.factors.riskLevel}
            </Badge>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900 mb-1">Project Maturity</div>
            <div className="text-xs text-gray-600">{prediction.factors.projectMaturity}</div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">AI Analysis</h4>

          {prediction.explanation.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {prediction.explanation.map((item, index) => (
                    <li key={index} className="text-sm">{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {prediction.recommendations.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">Recommendations</h5>
              <ul className="space-y-1">
                {prediction.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center justify-between">
            <span>Risk Multiplier: {prediction.riskMultiplier}x</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveCompletionCard;
