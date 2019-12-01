import { CellOwner } from '../../meta-model/CellOwner';

export interface Decision {
  cellsAtToAttack: ReadonlyArray<number>;
}

export function validateDecision(
  cells: ReadonlyArray<CellOwner>,
  decision: Readonly<Decision>,
): boolean {
  return decision.cellsAtToAttack.reduce<boolean>(
    (validAcc, cellAt) => {
      if (!validAcc) {
        return false;
      }
      return cells[cellAt] === CellOwner.None;
    },
    true,
  );
}
