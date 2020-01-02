import { StorableDQNAgent } from './StorableDQNAgent';

import dqnO3x399 from './brains/dqn-O-3x3-9-9.json';
import dqnX3x399 from './brains/dqn-X-3x3-9-9.json';

export const Brains: Record<string, StorableDQNAgent> = {
  'dqn-O-3x3-9-9': dqnO3x399,
  'dqn-X-3x3-9-9': dqnX3x399,
};
