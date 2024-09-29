export interface StorableAgent<T> {
  version: number;
  brain: T;
}

export function persistAgent<T>(id: string, version: number, brain: Readonly<T>): void {
  const data: StorableAgent<T> = {
    version,
    brain,
  };
  localStorage.setItem(id, JSON.stringify(data));
}

export function loadAgent<T>(id: string, version: number): T | undefined {
  const stored = localStorage.getItem(id);
  if (stored) {
    try {
      const parsed: StorableAgent<T> = JSON.parse(stored);
      if (parsed && parsed.version === version) {
        return parsed.brain;
      }
    } catch (e) {
      console.error('Could not load agent data for ', id, ' due to ', e);
    }
  }
  return undefined;
}
