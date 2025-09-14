import IssueCard from '../IssueCard';

export default function IssueCardExample() {
  const handleView = (id: string) => {
    console.log('View issue:', id);
  };

  return (
    <div className="p-4 space-y-4">
      <IssueCard
        id="issue-1"
        title="Pothole on Main Street causing traffic delays"
        description="Large pothole near the intersection of Main Street and Oak Avenue is causing significant traffic delays and potential vehicle damage. Several residents have reported flat tires."
        category="roads"
        priority="high"
        status="in_progress"
        location="Main Street & Oak Avenue"
        citizenName="Sarah Johnson"
        createdAt="2024-01-15"
        onView={handleView}
      />
      
      <IssueCard
        id="issue-2"
        title="Street light outage in residential area"
        description="Multiple street lights are out on Elm Street, creating safety concerns for evening pedestrians and reduced visibility for drivers."
        category="lighting"
        priority="medium"
        status="acknowledged"
        location="Elm Street (100-200 block)"
        citizenName="Michael Chen"
        createdAt="2024-01-12"
        onView={handleView}
      />
      
      <IssueCard
        id="issue-3"
        title="Drainage system backup after heavy rain"
        description="Storm drain near the community center is backing up during heavy rain, causing flooding in the parking area and access roads."
        category="drainage"
        priority="urgent"
        status="submitted"
        location="Community Center Parking Area"
        citizenName="Amanda Rodriguez"
        createdAt="2024-01-18"
        onView={handleView}
      />
    </div>
  );
}