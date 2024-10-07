import { DQNSolver } from 'reinforce-js';
import { BrainStatistics } from '../ai-agent/StorableAgent';

export interface StorableDQNAgent extends BrainStatistics {
  network: Parameters<DQNSolver['fromJSON']>[0];
}
