import { findDecisionForStateSpace, AIAgent, NormalizedStateSpace } from '../ai-agent/AIAgent';
import { findFreeCellIndices, takeAny, Decision } from '../ai-agent/Decision';
import { determineBoardNormalization, inverseNormalization, transformBoardCells } from '../../mechanics/BoardNormalization';
import { CellOwner } from '../../meta-model/CellOwner';
import { Board } from '../../meta-model/Board';

export interface MenaceStateSpace extends NormalizedStateSpace {
  boardAsString: string;
  boardAsCellOwners: ReadonlyArray<CellOwner>;
}

export interface MenaceAgent extends AIAgent<MenaceStateSpace> {
  startNewGame(): Promise<void>;
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

function buildStateSpace(board: Readonly<Board>): MenaceStateSpace {
  const normalization = determineBoardNormalization(board);
  const normalizedCells = transformBoardCells(board, normalization);
  return {
    normalization,
    inverseNormalization: inverseNormalization(normalization),
    dimensions: board.dimensions,
    boardAsString: normalizedCells.reduce((stateString, cellOwner) => `${stateString}${cellOwner}`, ''),
    boardAsCellOwners: normalizedCells,
  };
}

export async function findMenaceDecision(
  agent: MenaceAgent,
  board: Readonly<Board>,
): Promise<Decision | null> {
  return findDecisionForStateSpace(
    agent,
    board.cells,
    buildStateSpace(board),
    async () => {},
  );
}
