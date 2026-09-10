import type { DomainKey } from './domain-config';

export type Team = { id: string; name: string; domains: DomainKey[]; availability: string; distance: string; workload: number };

export const teams: Team[] = [
  { id: 'team-14', name: 'Northline Facilities', domains: ['school', 'college'], availability: 'Available now', distance: '1.8 km', workload: 3 },
  { id: 'team-22', name: 'Civic Works Crew', domains: ['construction', 'road-safety'], availability: 'Available in 20 min', distance: '2.4 km', workload: 5 },
  { id: 'team-31', name: 'Brightpath Electrical', domains: ['street-light', 'college'], availability: 'Available now', distance: '3.1 km', workload: 2 },
  { id: 'team-08', name: 'Waterway Response', domains: ['drainage', 'road-safety'], availability: 'Available in 45 min', distance: '1.2 km', workload: 4 },
  { id: 'team-44', name: 'Rapid Response Unit', domains: ['school', 'construction', 'street-light', 'drainage', 'road-safety'], availability: 'On call', distance: '4.6 km', workload: 1 },
];

export function recommendTeam(domain: DomainKey, severity: string) {
  return [...teams]
    .sort((a, b) => {
      const score = (team: Team) => (team.domains.includes(domain) ? 50 : 0) + (team.availability.includes('now') || team.availability === 'On call' ? 20 : 0) - team.workload * 3 - (severity === 'CRITICAL' ? Number.parseFloat(team.distance) * 2 : Number.parseFloat(team.distance));
      return score(b) - score(a);
    })[0];
}