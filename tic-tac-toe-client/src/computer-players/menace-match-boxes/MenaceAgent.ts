import {
  buildNormalizedStateSpace,
  findDecisionForStateSpace,
  AIAgent,
  NormalizedStateSpace,
} from '../ai-agent/AIAgent';
import { findFreeCellIndices, takeAny, Decision } from '../ai-agent/Decision';
import { transformBoardCells } from '../../mechanics/BoardNormalization';
import { Board } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

export interface MenaceStateSpace extends NormalizedStateSpace {
  boardAsString: string;
  boardAsCellOwners: ReadonlyArray<CellOwner>;
}

export interface MenaceAgent extends AIAgent<MenaceStateSpace> {
  startNewGame(): Promise<void>;
}

export function findFreeBeads(stateSpace: Readonly<MenaceStateSpace>): number[] {
  return findFreeCellIndices(stateSpace.boardAsCellOwners);
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

function buildMenaceStateSpace(board: Readonly<Board>): MenaceStateSpace {
  const normalizedStateSpace = buildNormalizedStateSpace(board);
  const normalizedCells = transformBoardCells(board, normalizedStateSpace.normalization);
  return {
    ...normalizedStateSpace,
    boardAsString: normalizedCells.reduce((stateString, cellOwner) => `${stateString}${cellOwner}`, ''),
    boardAsCellOwners: normalizedCells,
  };
}

export async function findMenaceDecision(
  agent: Readonly<MenaceAgent>,
  board: Readonly<Board>,
): Promise<Decision | null> {
  return findDecisionForStateSpace(
    agent,
    board.cells,
    buildMenaceStateSpace(board),
    async () => {},
  );
}
