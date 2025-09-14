import StatsCard from '../StatsCard';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Issues"
        value={156}
        description="All time reports"
        icon={AlertCircle}
        trend={{ value: 12, isPositive: false }}
      />
      
      <StatsCard
        title="Resolved Issues"
        value={134}
        description="Successfully completed"
        icon={CheckCircle}
        trend={{ value: 8, isPositive: true }}
      />
      
      <StatsCard
        title="In Progress"
        value={18}
        description="Currently being addressed"
        icon={Clock}
      />
      
      <StatsCard
        title="Active Citizens"
        value="2.4K"
        description="Registered users"
        icon={Users}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
}