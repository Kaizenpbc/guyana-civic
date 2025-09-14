import JurisdictionCard from '../JurisdictionCard';

export default function JurisdictionCardExample() {
  const handleSelect = (id: string) => {
    console.log('Jurisdiction selected:', id);
  };

  return (
    <div className="p-4 space-y-4">
      <JurisdictionCard
        id="metro-central"
        name="Metro Central District"
        description="Central business district managing commercial zones, transportation infrastructure, and downtown public services."
        contactEmail="info@metrocentral.gov"
        contactPhone="+1 (555) 123-4567"
        address="100 City Hall Plaza, Metro Central"
        issueCount={23}
        onSelect={handleSelect}
      />
      
      <JurisdictionCard
        id="riverside-municipal"
        name="Riverside Municipal Council"
        description="Residential area council responsible for parks, community centers, and local road maintenance."
        contactEmail="contact@riverside.municipal.gov"
        contactPhone="+1 (555) 987-6543"
        address="45 Riverside Community Center, Riverside"
        issueCount={8}
        onSelect={handleSelect}
      />
    </div>
  );
}