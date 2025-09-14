import EmployeeCard from '../EmployeeCard';

export default function EmployeeCardExample() {
  const handleViewDetails = (id: string) => {
    console.log('View employee details:', id);
  };

  const handleEditEmployee = (id: string) => {
    console.log('Edit employee:', id);
  };

  return (
    <div className="p-4 space-y-4">
      <EmployeeCard
        id="emp-1"
        fullName="Sarah Mitchell"
        position="Public Works Manager"
        department="Infrastructure & Utilities"
        email="sarah.mitchell@metrocentral.gov"
        phone="+1 (555) 234-5678"
        hireDate="2019-03-15"
        salary={75000}
        isActive={true}
        onViewDetails={handleViewDetails}
        onEditEmployee={handleEditEmployee}
      />
      
      <EmployeeCard
        id="emp-2"
        fullName="Marcus Rodriguez"
        position="HR Specialist"
        department="Human Resources"
        email="marcus.rodriguez@metrocentral.gov"
        phone="+1 (555) 345-6789"
        hireDate="2020-08-22"
        salary={58000}
        isActive={true}
        onViewDetails={handleViewDetails}
        onEditEmployee={handleEditEmployee}
      />
      
      <EmployeeCard
        id="emp-3"
        fullName="Jennifer Liu"
        position="Finance Coordinator"
        department="Finance & Administration"
        email="jennifer.liu@metrocentral.gov"
        hireDate="2018-01-10"
        salary={62000}
        isActive={false}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
}