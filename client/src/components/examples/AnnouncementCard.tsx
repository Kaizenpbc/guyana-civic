import AnnouncementCard from '../AnnouncementCard';

export default function AnnouncementCardExample() {
  return (
    <div className="p-4 space-y-4">
      <AnnouncementCard
        id="ann-1"
        title="Road Maintenance Schedule - Main Street"
        content="Main Street will undergo scheduled maintenance from January 25-27. Traffic will be diverted through Oak Avenue during construction hours (7 AM - 5 PM). Emergency access will remain available. We appreciate your patience as we improve our infrastructure."
        authorName="City Works Department"
        createdAt="2024-01-20"
        isActive={true}
      />
      
      <AnnouncementCard
        id="ann-2"
        title="Community Meeting - February Budget Planning"
        content="Join us for the annual budget planning meeting on February 15th at 7 PM in the Community Center. Citizens are encouraged to participate in discussions about infrastructure improvements, parks development, and public services funding for the upcoming fiscal year."
        authorName="Mayor Sarah Wilson"
        createdAt="2024-01-18"
        isActive={true}
      />
      
      <AnnouncementCard
        id="ann-3"
        title="Winter Storm Preparedness Tips"
        content="With winter weather approaching, residents should prepare emergency kits, check heating systems, and clear storm drains near their properties. For emergency assistance, contact our 24/7 hotline."
        authorName="Emergency Services"
        createdAt="2024-01-10"
        isActive={false}
      />
    </div>
  );
}