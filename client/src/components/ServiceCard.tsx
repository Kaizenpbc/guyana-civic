import React from 'react';
import { 
  AlertTriangle, 
  FileText, 
  Users, 
  Building, 
  MapPin, 
  Wrench, 
  Droplets, 
  Briefcase, 
  Hammer 
} from 'lucide-react';

interface ServiceCardProps {
  title: string;
  onClick?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, onClick }) => {
  // Use same color scheme as RDC 1 action buttons: Yellow, Red, Black, Green
  const getServiceColor = (title: string) => {
    // Cycle through all four Guyanese flag colors like RDC 1
    const services = ['Issue Reporting', 'Road Issues', 'Document Request', 'Community Programs', 'Agri Grants', 'Land Use Permit', 'Drainage Issues', 'Business License', 'Building Permit'];
    const index = services.indexOf(title);
    
    const colors = [
      { bg: '#FFD100', text: 'black' }, // Yellow
      { bg: '#EF3340', text: 'white' }, // Red
      { bg: '#000000', text: 'white' }, // Black
      { bg: '#009739', text: 'white' }  // Green
    ];
    
    return colors[index % 4];
  };

  // Get appropriate icon for each service
  const getServiceIcon = (title: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Issue Reporting': AlertTriangle,
      'Road Issues': MapPin,
      'Document Request': FileText,
      'Community Programs': Users,
      'Agri Grants': Wrench,
      'Land Use Permit': MapPin,
      'Drainage Issues': Droplets,
      'Business License': Briefcase,
      'Building Permit': Hammer
    };
    
    return iconMap[title] || Building;
  };

  const colors = getServiceColor(title);
  const IconComponent = getServiceIcon(title);

  return (
    <div
      className="shadow-md rounded-lg p-4 cursor-pointer transition transform hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center text-center min-h-[100px]"
      style={{ backgroundColor: colors.bg, color: colors.text }}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="h-6 w-6" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      <p className="text-sm opacity-90">Click to access</p>
    </div>
  );
};

export default ServiceCard;
