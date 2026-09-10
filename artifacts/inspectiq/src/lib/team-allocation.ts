import type { DomainKey } from './domain-config';

export type Team = { id: string; name: string; skills: string[]; domains: DomainKey[]; availability: string; distance: string; workload: number };

export const teams: Team[] = [
  { id: 'team-14', name: 'Northline Facilities', skills: ['School facilities', 'Campus facilities', 'Municipal services'], domains: ['school-education', 'higher-education', 'municipality'], availability: 'Available now', distance: '1.8 km', workload: 3 },
  { id: 'team-22', name: 'Civic Works Crew', skills: ['Road maintenance', 'Building safety', 'Transport facilities'], domains: ['construction-buildings', 'roads-highways', 'transport'], availability: 'Available in 20 min', distance: '2.4 km', workload: 5 },
  { id: 'team-31', name: 'Brightpath Electrical', skills: ['Electrical maintenance', 'Fire safety'], domains: ['electricity-lighting', 'fire-emergency'], availability: 'Available now', distance: '3.1 km', workload: 2 },
  { id: 'team-08', name: 'Waterway Response', skills: ['Drainage response', 'Water works', 'Environmental response'], domains: ['drainage-sanitation', 'water-supply', 'environment'], availability: 'Available in 45 min', distance: '1.2 km', workload: 4 },
  { id: 'team-44', name: 'Rapid Response Unit', skills: ['Fire safety', 'Health facilities', 'Environmental response'], domains: ['public-health', 'environment', 'fire-emergency'], availability: 'On call', distance: '4.6 km', workload: 1 },
];

export function recommendTeam(domain: DomainKey, severity: string, skill?: string) {
  return [...teams]
    .sort((a, b) => {
      const score = (team: Team) => (team.domains.includes(domain) ? 50 : 0) + (skill && team.skills.includes(skill) ? 30 : 0) + (team.availability.includes('now') || team.availability === 'On call' ? 20 : 0) - team.workload * 3 - (severity === 'CRITICAL' ? Number.parseFloat(team.distance) * 2 : Number.parseFloat(team.distance));
      return score(b) - score(a);
    })[0];
}