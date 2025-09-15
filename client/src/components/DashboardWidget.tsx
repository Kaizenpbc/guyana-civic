import React from 'react';

interface Sector {
  name: string;
  amount: string;
}

interface DashboardWidgetProps {
  budget: string;
  projects: number;
  complaintsResolved: string;
  sectors: Sector[];
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ budget, projects, complaintsResolved, sectors }) => {
  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h3 className="text-lg font-bold mb-4">Regional Snapshot</h3>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div><strong>Budget:</strong> {budget}</div>
        <div><strong>Active Projects:</strong> {projects}</div>
        <div><strong>Complaints Resolved:</strong> {complaintsResolved}</div>
      </div>
      <h4 className="text-md font-semibold mb-2">Sector Breakdown</h4>
      <ul className="list-disc ml-6">
        {sectors.map((sector, index) => (
          <li key={index}>{sector.name}: {sector.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardWidget;
