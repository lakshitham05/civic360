export function readStoredIncidents<T>(storageKey: string, fallback: T[]): T[] {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as T[] : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredIncidents<T>(storageKey: string, incidents: T[]) {
  localStorage.setItem(storageKey, JSON.stringify(incidents));
}

export function nextIncidentId(existingCount: number) {
  return `INC-${1025 + existingCount}`;
}