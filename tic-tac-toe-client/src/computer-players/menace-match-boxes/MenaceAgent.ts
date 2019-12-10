import { findDecisionForStateSpace, AIAgent } from '../ai-agent/AIAgent';
import { findFreeCellIndices, takeAny, Decision } from '../ai-agent/Decision';
import { CellOwner } from '../../meta-model/CellOwner';

export interface MenaceStateSpace {
  boardAsString: string;
  boardAsCellOwners: ReadonlyArray<CellOwner>;
}

export interface MenaceAgent extends AIAgent<MenaceStateSpace> {
  startNewGame(): Promise<void>;
}

function buildStateSpace(cells: ReadonlyArray<CellOwner>): MenaceStateSpace {
  return {
    boardAsString: cells.reduce((stateString, cellOwner) => `${stateString}${cellOwner}`, ''),
    boardAsCellOwners: cells,
  };
}

export function findFreeBeads({ boardAsCellOwners }: Readonly<MenaceStateSpace>): number[] {
  return findFreeCellIndices(boardAsCellOwners);
}

export function randomBead(beads: ReadonlyArray<number>): number[] {
  return takeAny(beads);
}

export function multiplyBeads(beads: ReadonlyArray<number>): number[] {
  const multipliedBeadsCount = Math.floor((beads.length + 2) / 2);
  let multipliedBeads: number[] = [];
  for (let i = 0; i < multipliedBeadsCount; i += 1) {
    multipliedBeads = [...multipliedBeads, ...beads];
  }
  return multipliedBeads;
}

export async function findMenaceDecision(
  agent: MenaceAgent,
  cells: ReadonlyArray<CellOwner>,
): Promise<Decision | null> {
  return findDecisionForStateSpace(agent, cells, buildStateSpace(cells), async () => {});
}
