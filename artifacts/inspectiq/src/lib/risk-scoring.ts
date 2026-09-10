import type { Severity } from './domain-config';

export function scoreToSeverity(score: number): Severity {
  if (score >= 80) return 'SAFE';
  if (score >= 60) return 'WARNING';
  return 'CRITICAL';
}

export function riskForIssue(issue: string, domainKey: string): { score: number; severity: Severity } {
  const seed = [...issue, ...domainKey].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const score = 43 + (seed % 55);
  return { score, severity: scoreToSeverity(score) };
}

export const severityTone = (severity: Severity) => {
  if (severity === 'CRITICAL') return { label: 'Critical', className: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' };
  if (severity === 'WARNING') return { label: 'Warning', className: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
  return { label: 'Safe', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
};