import { getDomain } from './domain-config';
import { riskForIssue } from './risk-scoring';

export type AnalysisResult = {
  issueDetected: string;
  findings: string[];
  confidence: number;
  severity: 'SAFE' | 'WARNING' | 'CRITICAL';
  safetyScore: number;
  recommendation: string;
};

export function analyzeDemo(domainKey: string, issue: string): AnalysisResult {
  const domain = getDomain(domainKey);
  const risk = riskForIssue(issue, domain.key);
  const shift = issue.length % 4;
  return {
    issueDetected: issue,
    findings: domain.findings.slice(0, 3),
    confidence: Math.min(98, 86 + shift * 3),
    severity: risk.severity,
    safetyScore: risk.score,
    recommendation: domain.recommendation,
  };
}