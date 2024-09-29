export interface BrainStatistics {
  draws: number;
  losses: number;
  wins: number;
}

export interface StorableAgent<BrainType extends BrainStatistics> {
  version: number;
  brain: BrainType;
}

/**
 * NOTE: The function is made asynchronous although {@code localStorage.setItem} isn't asynchronous.
 * It is for preparing supporting different storage targets.
 * @param id a unique identifier
 * @param version the version of the object format
 * @param brain the object to persist
 */
export async function persistAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
  brain: Readonly<BrainType>,
): Promise<void> {
  const data: StorableAgent<BrainType> = {
    version,
    brain,
  };
  localStorage.setItem(id, JSON.stringify(data));
}

/**
 * NOTE: The function is made asynchronous although {@code localStorage.getItem} isn't asynchronous.
 * It is for preparing supporting different storage targets.
 * @param id a unique identifier
 * @param version the version of the object format
 * @param defaultBrain a default value to return when no object for the given id exists yet
 */
export async function loadAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
  defaultBrain?: BrainType,
): Promise<BrainType | undefined> {
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
  return defaultBrain;
}
