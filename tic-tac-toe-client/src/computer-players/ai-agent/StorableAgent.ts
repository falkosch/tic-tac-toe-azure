export interface BrainStatistics {
  draws: number;
  losses: number;
  wins: number;
}

export interface StorableAgent<BrainType extends BrainStatistics> {
  version: number;
  brain: BrainType;
}

export function persistAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
  brain: Readonly<BrainType>,
): void {
  const data: StorableAgent<BrainType> = {
    version,
    brain,
  };
  localStorage.setItem(id, JSON.stringify(data));
}

export function loadAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
): BrainType | undefined {
  const stored = localStorage.getItem(id);
  if (stored) {
    try {
      const parsed: StorableAgent<BrainType> = JSON.parse(stored);
      if (parsed && parsed.version === version) {
        return parsed.brain;
      }
    } catch (e) {
      console.error('Could not load agent data for ', id, ' due to ', e);
    }
  }
  return undefined;
}
