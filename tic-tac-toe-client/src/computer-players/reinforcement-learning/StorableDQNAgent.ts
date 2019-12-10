import { BrainStatistics } from '../ai-agent/StorableAgent';

export interface StorableDQNAgent extends BrainStatistics {
  network: any;
}
