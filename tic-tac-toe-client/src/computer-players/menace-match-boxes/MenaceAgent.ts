import { findDecisionForStateSpace, AIAgent } from '../ai-agent/AIAgent';
import { CellOwner } from '../../meta-model/CellOwner';
import { Decision } from '../ai-agent/Decision';

export interface StateSpace {
  boardAsString: string;
  boardAsCellOwners: ReadonlyArray<CellOwner>;
}

export type MenaceAgent = AIAgent<StateSpace>;

function buildStateSpace(cells: ReadonlyArray<CellOwner>): StateSpace {
  return {
    boardAsString: cells.reduce((stateString, cellOwner) => `${stateString}${cellOwner}`, ''),
    boardAsCellOwners: cells,
  };
}

export function findFreeBeads({ boardAsCellOwners }: Readonly<StateSpace>): number[] {
  const freeBeads: number[] = [];
  boardAsCellOwners.forEach((cellOwner, index) => {
    if (cellOwner === CellOwner.None) {
      freeBeads.push(index);
    }
  });
  return freeBeads;
}

export function multiplyBeads(beads: ReadonlyArray<number>): number[] {
  const multipliedBeadsCount = Math.floor((beads.length + 2) / 2);
  let multipliedBeads: number[] = [];
  for (let i = 0; i < multipliedBeadsCount; i += 1) {
    multipliedBeads = [...multipliedBeads, ...beads];
  }
  return multipliedBeads;
}

export function findMenaceDecision(
  agent: MenaceAgent,
  cells: ReadonlyArray<CellOwner>,
): Decision | null {
  return findDecisionForStateSpace(agent, cells, buildStateSpace(cells), () => {});
}

export function randomBead(beads: ReadonlyArray<number>): number {
  return beads[Math.floor(Math.random() * beads.length)];
}
