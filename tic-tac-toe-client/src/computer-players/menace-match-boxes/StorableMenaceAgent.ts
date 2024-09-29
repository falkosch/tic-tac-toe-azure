import { BrainStatistics } from '../ai-agent/StorableAgent';

export interface PlayedMove {
  bead: number;
  boardAsString: string;
}

export type Matchboxes = Record<string, number[]>;

export interface StorableMenaceAgent extends BrainStatistics {
  longTermMatchboxes: Record<string, number[]>;
  matchboxes: Matchboxes;
  playedMoves: PlayedMove[];
}

export function cloneMatchboxes(memory: Readonly<Matchboxes>): Matchboxes {
  return Object.entries(memory)
    .reduce<Matchboxes>(
      (clonedMatchboxes, [board, beads]) => ({
        ...clonedMatchboxes,
        [board]: [...beads],
      }),
      {},
    );
}
