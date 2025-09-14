import TimesheetCard from '../TimesheetCard';

export default function TimesheetCardExample() {
  const handleEdit = (id: string) => {
    console.log('Edit timesheet:', id);
  };

  const handleView = (id: string) => {
    console.log('View timesheet details:', id);
  };

  const mockEntries = [
    { date: "2024-01-15", hoursWorked: 8, project: "Road Maintenance", notes: "Main St repairs" },
    { date: "2024-01-16", hoursWorked: 8, project: "Park Cleanup", notes: "Central Park maintenance" },
    { date: "2024-01-17", hoursWorked: 10, overtimeHours: 2, project: "Emergency Response", notes: "Storm damage repair" },
    { date: "2024-01-18", hoursWorked: 8, project: "Regular Duties" },
    { date: "2024-01-19", hoursWorked: 6, project: "Training" },
  ];

  return (
    <div className="p-4 space-y-4">
      <TimesheetCard
        id="ts-1"
        weekEnding="2024-01-19"
        totalHours={40}
        regularHours={38}
        overtimeHours={2}
        status="approved"
        employeeName="Sarah Mitchell"
        entries={mockEntries}
        onEdit={handleEdit}
        onView={handleView}
        isEditable={false}
      />
      
      <TimesheetCard
        id="ts-2"
        weekEnding="2024-01-12"
        totalHours={42}
        regularHours={40}
        overtimeHours={2}
        status="submitted"
        employeeName="Marcus Rodriguez"
        entries={mockEntries.slice(0, 3)}
        onEdit={handleEdit}
        onView={handleView}
        isEditable={false}
      />
      
      <TimesheetCard
        id="ts-3"
        weekEnding="2024-01-05"
        totalHours={35}
        regularHours={35}
        overtimeHours={0}
        status="draft"
        employeeName="Jennifer Liu"
        entries={mockEntries.slice(0, 4)}
        onEdit={handleEdit}
        onView={handleView}
        isEditable={true}
      />
    </div>
  );
}