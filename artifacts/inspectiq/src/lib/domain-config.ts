import {
  Building2,
  Construction,
  Droplets,
  GraduationCap,
  Lightbulb,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type DomainKey = 'school' | 'college' | 'construction' | 'street-light' | 'drainage' | 'road-safety';
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
};

export const domainConfigs: DomainConfig[] = [
  {
    key: 'school',
    name: 'School',
    short: 'Learning spaces',
    description: 'Keep classrooms, exits, and shared spaces safe for every learner.',
    icon: GraduationCap,
    tint: 'from-amber-100 to-orange-50',
    issues: ['Structural condition', 'Emergency exit', 'Electrical safety', 'Stair/railing condition', 'Cleanliness/obstruction'],
    checklist: ['Structural condition', 'Emergency exit', 'Electrical safety', 'Stair/railing condition', 'Cleanliness/obstruction'],
    findings: ['Hairline cracking observed around a classroom lintel.', 'Emergency exit signage is visible and unobstructed.', 'No exposed conductors found during visual review.'],
    recommendation: 'Schedule a qualified facilities review within 48 hours and cordon the affected area if cracking widens.',
    sampleLocations: ['Cedar Grove Primary', 'North Ward Learning Centre', 'Lakeview Public School'],
  },
  {
    key: 'college',
    name: 'College',
    short: 'Campus readiness',
    description: 'Coordinate resilient campuses, labs, and student routes.',
    icon: Building2,
    tint: 'from-sky-100 to-cyan-50',
    issues: ['Building condition', 'Emergency exits', 'Electrical safety', 'Laboratory safety', 'Stair/railing condition'],
    checklist: ['Building condition', 'Emergency exits', 'Electrical safety', 'Laboratory safety', 'Stair/railing condition'],
    findings: ['Lab chemical labels are present and readable.', 'One corridor exit has reduced clearance from stored materials.', 'Railing anchors are secure on the inspected flight.'],
    recommendation: 'Clear corridor storage today and log a facilities follow-up for the lab ventilation check.',
    sampleLocations: ['Rivermark Technical College', 'Civic Arts Campus', 'Eastline Community College'],
  },
  {
    key: 'construction',
    name: 'Construction',
    short: 'Active sites',
    description: 'Bring consistent safety checks to fast-moving work sites.',
    icon: Construction,
    tint: 'from-orange-100 to-yellow-50',
    issues: ['Helmet compliance', 'Safety vest', 'Safety harness', 'Fall hazard', 'Unsafe work area'],
    checklist: ['Helmet compliance', 'Safety vest', 'Safety harness', 'Fall hazard', 'Unsafe work area'],
    findings: ['Two workers are visible without high-visibility vests.', 'Perimeter barrier is incomplete on the east edge.', 'A fall exposure is present near the open slab.'],
    recommendation: 'Pause work at the east edge, restore the barrier, and confirm harness and vest compliance before resuming.',
    sampleLocations: ['Mason Street Renewal', 'Harbourline Apartments', 'West Junction Depot'],
  },
  {
    key: 'street-light',
    name: 'Street Light',
    short: 'Night visibility',
    description: 'Verify public lighting so streets stay legible after dark.',
    icon: Lightbulb,
    tint: 'from-yellow-100 to-lime-50',
    issues: ['Light working', 'Pole condition', 'Electrical enclosure', 'Wiring condition', 'Visibility'],
    checklist: ['Light working', 'Pole condition', 'Electrical enclosure', 'Wiring condition', 'Visibility'],
    findings: ['Lamp is not emitting light in the supplied dusk image.', 'Pole is upright with surface corrosion at the base.', 'Electrical enclosure appears closed and intact.'],
    recommendation: 'Dispatch an electrical maintenance crew before the next evening peak and inspect the base corrosion.',
    sampleLocations: ['Marlow & 8th', 'Rosewood Bus Stop', 'Civic Market Approach'],
  },
  {
    key: 'drainage',
    name: 'Drainage',
    short: 'Water flow',
    description: 'Spot blockages and overflow before they become neighbourhood disruption.',
    icon: Droplets,
    tint: 'from-teal-100 to-emerald-50',
    issues: ['Blockage', 'Overflow', 'Structural damage', 'Waste accumulation', 'Water flow'],
    checklist: ['Blockage', 'Overflow', 'Structural damage', 'Waste accumulation', 'Water flow'],
    findings: ['Debris is restricting the inlet by an estimated half-width.', 'Standing water is visible along the curb line.', 'No major wall displacement is visible.'],
    recommendation: 'Clear the inlet and re-check water flow after the next rainfall; escalate if standing water remains.',
    sampleLocations: ['Juniper Lane Inlet', 'Old Mill Underpass', 'Southbank Channel'],
  },
  {
    key: 'road-safety',
    name: 'Road Safety',
    short: 'Safer movement',
    description: 'Turn street-level observations into safer routes for everyone.',
    icon: ShieldCheck,
    tint: 'from-rose-100 to-orange-50',
    issues: ['Pothole', 'Road surface', 'Traffic sign', 'Road obstruction', 'Drain/shoulder condition'],
    checklist: ['Pothole', 'Road surface', 'Traffic sign', 'Road obstruction', 'Drain/shoulder condition'],
    findings: ['Surface depression measures approximately 9 cm at its deepest point.', 'Approach warning paint is worn and low contrast.', 'Traffic remains passable but lane position is changing.'],
    recommendation: 'Place a temporary warning marker and schedule a patch crew before the next commuter peak.',
    sampleLocations: ['Alder Avenue & 3rd', 'Foundry Road Bend', 'Pinecrest School Crossing'],
  },
];

export const getDomain = (key?: string | null) => domainConfigs.find((domain) => domain.key === key) ?? domainConfigs[0];