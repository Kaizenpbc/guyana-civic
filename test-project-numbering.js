// Test script to demonstrate project numbering system
console.log('🧪 Project Numbering System Demonstration\n');

// Mock jurisdictions with identifiers
const mockJurisdictions = {
  'region-1': { id: 'region-1', identifier: 'RDC1', name: 'Barima-Waini (Region 1)' },
  'region-2': { id: 'region-2', identifier: 'RDC2', name: 'Pomeroon-Supenaam (Region 2)' },
  'region-3': { id: 'region-3', identifier: 'RDC3', name: 'Essequibo Islands-West Demerara (Region 3)' },
  'region-4': { id: 'region-4', identifier: 'RDC4', name: 'Demerara-Mahaica (Region 4)' },
  'region-5': { id: 'region-5', identifier: 'RDC5', name: 'Mahaica-Berbice (Region 5)' },
  'region-6': { id: 'region-6', identifier: 'RDC6', name: 'East Berbice-Corentyne (Region 6)' },
  'region-7': { id: 'region-7', identifier: 'RDC7', name: 'Cuyuni-Mazaruni (Region 7)' },
  'region-8': { id: 'region-8', identifier: 'RDC8', name: 'Potaro-Siparuni (Region 8)' },
  'region-9': { id: 'region-9', identifier: 'RDC9', name: 'Upper Takutu-Upper Essequibo (Region 9)' },
  'region-10': { id: 'region-10', identifier: 'RDC10', name: 'Upper Demerara-Berbice (Region 10)' }
};

// Mock existing projects by jurisdiction
const mockProjectCounts = {
  'region-1': 0,
  'region-2': 0,
  'region-3': 0,
  'region-4': 0,
  'region-5': 0,
  'region-6': 0,
  'region-7': 0,
  'region-8': 0,
  'region-9': 0,
  'region-10': 0
};

// Function to generate project code (simulating the backend logic)
function generateProjectCode(jurisdictionId) {
  const jurisdiction = mockJurisdictions[jurisdictionId];
  if (!jurisdiction) {
    throw new Error(`Jurisdiction ${jurisdictionId} not found`);
  }

  // Get current count and increment
  const currentCount = mockProjectCounts[jurisdictionId] + 1;
  mockProjectCounts[jurisdictionId] = currentCount;

  // Format as {identifier}-{sequentialNumber}
  return `${jurisdiction.identifier}-${currentCount.toString().padStart(6, '0')}`;
}

console.log('🏗️ Testing Project Code Generation:\n');

const testCases = [
  { jurisdictionId: 'region-4', name: 'Georgetown Hospital Expansion' },
  { jurisdictionId: 'region-4', name: 'Georgetown Road Repairs' },
  { jurisdictionId: 'region-2', name: 'Anna Regina Sports Complex' },
  { jurisdictionId: 'region-2', name: 'Anna Regina School Construction' },
  { jurisdictionId: 'region-1', name: 'Mabaruma Bridge Project' },
  { jurisdictionId: 'region-4', name: 'Georgetown Central Park' },
  { jurisdictionId: 'region-7', name: 'Bartica Mining Road' }
];

console.log('📋 Generated Project Codes:\n');

testCases.forEach((testCase, index) => {
  try {
    const code = generateProjectCode(testCase.jurisdictionId);
    const jurisdiction = mockJurisdictions[testCase.jurisdictionId];
    console.log(`${index + 1}. ${jurisdiction.name}`);
    console.log(`   📝 ${testCase.name}`);
    console.log(`   🏷️  Code: ${code}`);
    console.log('');
  } catch (error) {
    console.log(`❌ Error for ${testCase.name}: ${error.message}`);
  }
});

console.log('📊 Final Project Counts by RDC:');
Object.entries(mockProjectCounts).forEach(([jurisdictionId, count]) => {
  if (count > 0) {
    const jurisdiction = mockJurisdictions[jurisdictionId];
    console.log(`   ${jurisdiction.identifier} (${jurisdiction.name}): ${count} projects`);
  }
});

console.log('\n🎯 Key Benefits of This Numbering System:');
console.log('✅ Unique identifiers across all RDCs');
console.log('✅ Clear regional organization (RDC1, RDC2, etc.)');
console.log('✅ Sequential numbering within each RDC');
console.log('✅ Easy to track and reference projects');
console.log('✅ Supports up to 999,999 projects per RDC');
console.log('✅ Human-readable and sortable');

console.log('\n🎉 Project Numbering System Ready for Implementation!');
