import { BrainStatistics } from '../ai-agent/StorableAgent';

export interface PlayedMove {
  bead: number;
  boardAsString: string;
}

export type Matchboxes = Record<string, number[]>;

export interface StorableMenaceAgent extends BrainStatistics {
  matchboxes: Matchboxes;
  playedMoves: PlayedMove[];
}
