import {
  Construction,
  Droplets,
  Flame,
  HeartPulse,
  GraduationCap,
  Landmark,
  Lightbulb,
  BusFront,
  Recycle,
  ShieldCheck,
  University,
  type LucideIcon,
} from 'lucide-react';

export type DomainKey = 'roads-highways' | 'electricity-lighting' | 'water-supply' | 'drainage-sanitation' | 'school-education' | 'higher-education' | 'construction-buildings' | 'public-health' | 'environment' | 'transport' | 'municipality' | 'fire-emergency';
export type Severity = 'SAFE' | 'WARNING' | 'CRITICAL';

export type DomainConfig = {
  key: DomainKey;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  issues: string[];
  checklist: string[];
  findings: string[];
  recommendation: string;
  sampleLocations: string[];
  recommendedSkill: string;
};

export const domainConfigs: DomainConfig[] = [
  {
    key: 'roads-highways', name: 'Roads & Highways', short: 'Safer movement', description: 'Turn street-level observations into safer routes for everyone.', icon: ShieldCheck, tint: 'from-rose-100 to-orange-50',
    issues: ['Pothole', 'Damaged road', 'Missing traffic sign', 'Road obstruction', 'Damaged road shoulder'],
    checklist: ['Surface condition', 'Warning signage', 'Lane clearance', 'Shoulder stability', 'Safe traffic flow'],
    findings: ['Surface depression is changing lane position.', 'Approach warning paint is worn and low contrast.', 'Traffic remains passable with reduced shoulder clearance.'],
    recommendation: 'Place a temporary warning marker and schedule a patch crew before the next commuter peak.',
    sampleLocations: ['Alder Avenue & 3rd', 'Foundry Road Bend', 'Pinecrest School Crossing'], recommendedSkill: 'Road maintenance',
  },
  {
    key: 'electricity-lighting', name: 'Electricity & Street Lighting', short: 'Night visibility', description: 'Verify public lighting and electrical assets before small faults become hazards.', icon: Lightbulb, tint: 'from-yellow-100 to-lime-50',
    issues: ['Street light not working', 'Damaged pole', 'Exposed wiring', 'Electrical enclosure issue'],
    checklist: ['Lamp output', 'Pole condition', 'Wiring visibility', 'Enclosure secured', 'Public clearance'],
    findings: ['Lamp is not emitting light in the supplied dusk image.', 'Pole is upright with surface corrosion at the base.', 'Electrical enclosure appears closed and intact.'],
    recommendation: 'Dispatch an electrical maintenance crew before the next evening peak and isolate exposed conductors.',
    sampleLocations: ['Rosewood Bus Stop', 'Marlow & 8th', 'Civic Market Approach'], recommendedSkill: 'Electrical maintenance',
  },
  {
    key: 'water-supply', name: 'Water Supply', short: 'Reliable water', description: 'Keep distribution lines dependable, clean, and visible to the community.', icon: Droplets, tint: 'from-sky-100 to-cyan-50',
    issues: ['Water leakage', 'Broken pipeline', 'Water supply interruption', 'Contamination concern'],
    checklist: ['Leak source', 'Pipe condition', 'Flow restored', 'Public hygiene', 'Area isolation'],
    findings: ['A persistent wet patch indicates an active leak.', 'Flow is reduced beyond the affected connection.', 'Standing water requires a hygiene check before reopening.'],
    recommendation: 'Isolate the affected line, protect pedestrians, and schedule a water-works repair crew.',
    sampleLocations: ['East Bank Valve House', 'Lakeview Ward 4', 'Market Street Junction'], recommendedSkill: 'Water works',
  },
  {
    key: 'drainage-sanitation', name: 'Drainage & Sanitation', short: 'Water flow', description: 'Spot blockages and overflow before they become neighbourhood disruption.', icon: Recycle, tint: 'from-teal-100 to-emerald-50',
    issues: ['Drain blockage', 'Overflow', 'Waste accumulation', 'Damaged drainage structure'],
    checklist: ['Inlet clear', 'Overflow evidence', 'Waste removal', 'Wall stability', 'Water flow'],
    findings: ['Debris is restricting the inlet by an estimated half-width.', 'Standing water is visible along the curb line.', 'No major wall displacement is visible.'],
    recommendation: 'Clear the inlet and re-check water flow after the next rainfall; escalate if standing water remains.',
    sampleLocations: ['Juniper Lane Inlet', 'Old Mill Underpass', 'Southbank Channel'], recommendedSkill: 'Drainage response',
  },
  {
    key: 'school-education', name: 'School Education', short: 'Learning spaces', description: 'Keep classrooms, exits, and shared spaces safe for every learner.', icon: GraduationCap, tint: 'from-amber-100 to-orange-50',
    issues: ['Building safety', 'Electrical safety', 'Toilet/sanitation issue', 'Stair/railing issue', 'Emergency exit issue'],
    checklist: ['Structure', 'Electrical safety', 'Sanitation', 'Stairs and railings', 'Emergency exit'],
    findings: ['Emergency exit signage is visible and unobstructed.', 'No exposed conductors found during visual review.', 'A facilities follow-up is appropriate for the affected area.'],
    recommendation: 'Schedule a qualified facilities review within 48 hours and cordon any affected area.',
    sampleLocations: ['Cedar Grove Primary', 'North Ward Learning Centre', 'Lakeview Public School'], recommendedSkill: 'School facilities',
  },
  {
    key: 'higher-education', name: 'Higher Education', short: 'Campus readiness', description: 'Coordinate resilient campuses, labs, and student routes.', icon: University, tint: 'from-violet-100 to-sky-50',
    issues: ['Building condition', 'Laboratory safety', 'Electrical safety', 'Emergency exit', 'Campus infrastructure'],
    checklist: ['Building condition', 'Lab controls', 'Electrical safety', 'Exit clearance', 'Campus access'],
    findings: ['Lab chemical labels are present and readable.', 'One corridor exit has reduced clearance from stored materials.', 'Railing anchors are secure on the inspected flight.'],
    recommendation: 'Clear corridor storage today and log a facilities follow-up for lab ventilation.',
    sampleLocations: ['Rivermark Technical College', 'Civic Arts Campus', 'Eastline Community College'], recommendedSkill: 'Campus facilities',
  },
  {
    key: 'construction-buildings', name: 'Construction & Buildings', short: 'Active sites', description: 'Bring consistent safety checks to fast-moving work sites and public structures.', icon: Construction, tint: 'from-orange-100 to-yellow-50',
    issues: ['Unsafe construction area', 'Structural concern', 'Fall hazard', 'Missing safety equipment', 'Unsafe work area'],
    checklist: ['Perimeter barrier', 'Structural signs', 'Fall exposure', 'Safety equipment', 'Work area clearance'],
    findings: ['Perimeter barrier is incomplete on the east edge.', 'A fall exposure is present near the open slab.', 'Visible PPE compliance is inconsistent.'],
    recommendation: 'Pause work at the exposed edge, restore the barrier, and confirm PPE compliance.',
    sampleLocations: ['Mason Street Renewal', 'Harbourline Apartments', 'West Junction Depot'], recommendedSkill: 'Building safety',
  },
  {
    key: 'public-health', name: 'Public Health', short: 'Healthy facilities', description: 'Make maintenance, hygiene, and public health risks visible early.', icon: HeartPulse, tint: 'from-pink-100 to-rose-50',
    issues: ['Facility maintenance', 'Sanitation issue', 'Water/hygiene issue', 'Waste disposal issue'],
    checklist: ['Facility condition', 'Sanitation', 'Water and hygiene', 'Waste disposal', 'Public access'],
    findings: ['A hygiene concern is visible around a high-contact area.', 'Waste segregation is not consistently maintained.', 'Public access remains possible with a short-term control.'],
    recommendation: 'Correct the hygiene control today and schedule a facilities verification visit.',
    sampleLocations: ['Ward Health Centre', 'Riverside Clinic', 'North Market Dispensary'], recommendedSkill: 'Health facilities',
  },
  {
    key: 'environment', name: 'Environment', short: 'Clean surroundings', description: 'Coordinate responses to dumping, pollution, and environmental hazards.', icon: Recycle, tint: 'from-emerald-100 to-teal-50',
    issues: ['Waste dumping', 'Pollution concern', 'Drain contamination', 'Environmental hazard'],
    checklist: ['Source identified', 'Containment', 'Drain impact', 'Public exposure', 'Cleanup access'],
    findings: ['Unsegregated material is visible at the edge of the drain.', 'Runoff could carry contamination toward a public inlet.', 'A cleanup boundary can be established without closing the road.'],
    recommendation: 'Contain the material, arrange safe removal, and sample the affected drain if needed.',
    sampleLocations: ['Canal Road Edge', 'Southbank Transfer Point', 'Industrial Estate Gate'], recommendedSkill: 'Environmental response',
  },
  {
    key: 'transport', name: 'Transport', short: 'Connected routes', description: 'Keep stops, public transport facilities, and movement corridors usable.', icon: BusFront, tint: 'from-cyan-100 to-blue-50',
    issues: ['Bus stop infrastructure', 'Road/transport safety', 'Damaged public transport facility', 'Obstruction'],
    checklist: ['Passenger access', 'Stop structure', 'Route safety', 'Signage', 'Obstruction clearance'],
    findings: ['Passenger waiting space is reduced by a damaged edge.', 'Stop signage remains readable but needs secure mounting.', 'The route is accessible with a temporary barrier.'],
    recommendation: 'Secure the passenger area and schedule a transport-facilities repair visit.',
    sampleLocations: ['Rosewood Bus Stop', 'Central Terminus Bay 2', 'East Gate Shelter'], recommendedSkill: 'Transport facilities',
  },
  {
    key: 'municipality', name: 'Municipality / Local Body', short: 'Everyday services', description: 'Coordinate the public infrastructure and services residents rely on daily.', icon: Landmark, tint: 'from-stone-100 to-amber-50',
    issues: ['Public infrastructure damage', 'Waste collection issue', 'Street maintenance', 'Public facility issue'],
    checklist: ['Public access', 'Asset condition', 'Collection service', 'Street condition', 'Facility safety'],
    findings: ['The public asset is usable but requires a scheduled repair.', 'Collection access is reduced by the reported obstruction.', 'A temporary notice would help residents navigate the area.'],
    recommendation: 'Protect public access, schedule the relevant local-body crew, and confirm completion.',
    sampleLocations: ['Town Hall Approach', 'Ward 12 Community Hall', 'Market Square'], recommendedSkill: 'Municipal services',
  },
  {
    key: 'fire-emergency', name: 'Fire & Emergency Safety', short: 'Ready response', description: 'Protect emergency access, exits, and life-safety systems across public buildings.', icon: Flame, tint: 'from-red-100 to-orange-50',
    issues: ['Blocked emergency exit', 'Fire safety equipment issue', 'Emergency access obstruction', 'Building fire-safety concern'],
    checklist: ['Exit clear', 'Equipment present', 'Emergency access', 'Fire signage', 'Building controls'],
    findings: ['The emergency route is partially reduced by stored material.', 'Safety signage needs a closer verification.', 'Access can be restored with a same-day clearance.'],
    recommendation: 'Clear the emergency route immediately and arrange a fire-safety verification visit.',
    sampleLocations: ['Civic Auditorium', 'South Ward Office', 'Harbourline Apartments'], recommendedSkill: 'Fire safety',
  },
];

export const getDomain = (key?: string | null) => domainConfigs.find((domain) => domain.key === key) ?? domainConfigs[0];

export const legacyDomainMap: Record<string, DomainKey> = {
  school: 'school-education', college: 'higher-education', construction: 'construction-buildings',
  'street-light': 'electricity-lighting', drainage: 'drainage-sanitation', 'road-safety': 'roads-highways',
};