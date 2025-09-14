import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Users, Mail, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { OrgChartNode } from "@shared/schema";

interface OrgChartProps {
  rootEmployeeId?: string;
  depth?: number;
  className?: string;
}

interface OrgNodeProps {
  node: OrgChartNode;
  level: number;
  onNodeClick?: (nodeId: string) => void;
}

function OrgNode({ node, level, onNodeClick }: OrgNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative" data-testid={`org-node-${node.id}`}>
      {/* Node Card */}
      <div className={`mb-3 ${level > 0 ? 'ml-8' : ''}`}>
        <Card className="hover-elevate cursor-pointer" onClick={() => onNodeClick?.(node.id)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(node.fullName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{node.fullName}</h4>
                  <p className="text-sm text-muted-foreground truncate">{node.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{node.department}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {hasChildren && (
                  <Badge variant="outline" className="text-xs">
                    {node.children.length} report{node.children.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    data-testid={`button-toggle-${node.id}`}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Line */}
        {level > 0 && (
          <div className="absolute left-4 top-0 w-px h-4 bg-border -translate-y-4" />
        )}
        {hasChildren && isExpanded && (
          <div className="absolute left-4 bottom-0 w-px bg-border translate-y-3" style={{ height: `${node.children.length * 120}px` }} />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="relative" data-testid={`org-children-${node.id}`}>
          {/* Horizontal connection lines */}
          {node.children.map((_, index) => (
            <div
              key={index}
              className="absolute w-4 h-px bg-border"
              style={{
                left: '16px',
                top: `${index * 120 + 60}px`,
              }}
            />
          ))}
          
          {/* Child nodes */}
          {node.children.map((child) => (
            <OrgNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart({ 
  rootEmployeeId, 
  depth = 3, 
  className = "" 
}: OrgChartProps) {
  const { 
    data: orgTree, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['/api/hr/org/tree', rootEmployeeId, depth],
    queryFn: async (): Promise<OrgChartNode[]> => {
      const params = new URLSearchParams();
      if (rootEmployeeId) params.append('rootEmployeeId', rootEmployeeId);
      params.append('depth', depth.toString());

      const response = await fetch(`/api/hr/org/tree?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch organizational chart');
      }
      return response.json();
    },
  });

  const handleNodeClick = (nodeId: string) => {
    console.log('Node clicked:', nodeId);
    // TODO: Could navigate to employee details or update selection
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load organizational chart. Please try again.
            </AlertDescription>
          </Alert>
          <Button onClick={() => refetch()} className="mt-4" size="sm" data-testid="button-retry-org">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="org-chart-container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Organizational Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="ml-8 space-y-3">
              <Skeleton className="h-16 w-5/6" />
              <Skeleton className="h-16 w-4/6" />
            </div>
          </div>
        ) : !orgTree || orgTree.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizational data found</h3>
            <p className="text-muted-foreground">
              {rootEmployeeId 
                ? "This employee has no organizational structure available." 
                : "No organizational structure found for this department."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-testid="org-tree-content">
            {orgTree.map((rootNode) => (
              <OrgNode
                key={rootNode.id}
                node={rootNode}
                level={0}
                onNodeClick={handleNodeClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}