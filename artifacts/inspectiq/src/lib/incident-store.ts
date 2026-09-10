import { legacyDomainMap, type DomainKey, type Severity } from './domain-config';

export type IncidentStatus = 'Reported' | 'Inspection Scheduled' | 'Inspection Active' | 'Inspection Completed' | 'Assigned' | 'Team Accepted' | 'Action In Progress' | 'Resolved';
export type Feedback = { resolved: boolean; rating: number; text: string; submittedAt: string };
export type Incident = {
  id: string; domain: DomainKey; issue: string; description: string; photo?: string; location: string; coordinates?: string; date: string; time: string;
  severity: Severity; riskScore: number; recommendation: string; status: IncidentStatus; inspectionStatus: string; inspectionPhoto?: string;
  inspectionNotes?: string; inspectionFindings?: string[]; assignedTeam?: string; resolutionStatus: string; feedback?: Feedback;
  resolutionDate?: string; resolutionNote?: string; resolutionPhoto?: string; reporter: string; source: 'Citizen report' | 'Inspection';
};
const legacyStatusMap: Record<string, IncidentStatus> = {
  'Under Inspection': 'Inspection Active',
  Verified: 'Inspection Completed',
  'In Progress': 'Action In Progress',
  Reported: 'Reported',
  Assigned: 'Assigned',
  Resolved: 'Resolved',
};

export function readStoredIncidents<T>(storageKey: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored) as Array<Record<string, unknown>>;
    return parsed.map((old) => {
      const legacy = old.domain as string;
      const oldStatus = String(old.status ?? 'Reported');
      const status = legacyStatusMap[oldStatus] ?? oldStatus;
      return { ...old, domain: legacyDomainMap[legacy] ?? legacy, status, description: old.description ?? old.issue ?? 'Reported public-service concern', inspectionStatus: old.inspectionStatus ?? (status === 'Inspection Completed' ? 'Completed' : 'Pending'), resolutionStatus: old.resolutionStatus ?? (status === 'Resolved' ? 'Resolved' : 'Open'), source: old.source ?? 'Citizen report' };
    }) as T[];
  } catch {
    return fallback;
  }
}

export function writeStoredIncidents<T>(storageKey: string, incidents: T[]) {
  localStorage.setItem(storageKey, JSON.stringify(incidents));
}

export function nextIncidentId(existing: number | Array<{ id: string }>) {
  if (Array.isArray(existing)) {
    const max = existing.reduce((highest, item) => Math.max(highest, Number(item.id.replace(/\D/g, '')) || 0), 1024);
    return `INC-${max + 1}`;
  }
  return `INC-${1025 + existing}`;
}