import { countPoints, remainingMoves } from '../../mechanics/GameRules';
import { findConsecutiveness } from '../../mechanics/Consecutiveness';
import { Board } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';
import { GameReaction } from '../../meta-model/GameReaction';

export interface StateSpace {
  states: ReadonlyArray<number>;
}

export interface Decision {
  cellsAtToAttack: ReadonlyArray<number>;
}

export interface ReinforcedAgent {
  decide(prior: StateSpace): Decision;
  reward(value: number): void;
}

export type CellUpdater = (cellOwner: Readonly<CellOwner>, cellAt: number) => CellOwner;

export function buildCellUpdater(decision: Readonly<Decision>): CellUpdater {
  return (cellOwner, cellAt) => {
    if (decision.cellsAtToAttack.indexOf(cellAt) >= 0) {
      return CellOwner.O;
    }
    return cellOwner;
  };
}

function validateDecision(board: Readonly<Board>, decision: Readonly<Decision>): boolean {
  return decision.cellsAtToAttack.reduce<boolean>(
    (validAcc, cellAt) => {
      const cellOwner = board.cells[cellAt];
      return validAcc && cellOwner === CellOwner.None;
    },
    true,
  );
}

export function boardValue(board: Readonly<Board>): number {
  const points = countPoints(board, findConsecutiveness(board));
  return points[CellOwner.O] - points[CellOwner.X];
}

export function commenceReaction(
  gameReaction: Readonly<GameReaction>,
  agent: ReinforcedAgent,
  cellToState: (cellOwner: CellOwner, index?: number) => number,
): GameReaction {
  const stateSpace = {
    states: gameReaction.board.cells.map(cellToState),
  };

  for (let i = 0; i < 100; i += 1) {
    const decision = agent.decide(stateSpace);

    if (validateDecision(gameReaction.board, decision)) {
      const cellUpdater = buildCellUpdater(decision);
      const updatedBoard = {
        ...gameReaction.board,
        cells: gameReaction.board.cells.map(cellUpdater),
      };
      agent.reward(boardValue(updatedBoard) - 1);

      return {
        ...gameReaction,
        board: updatedBoard,
      };
    }

    // punish the agent for invalid reactions so that it learns from that too
    agent.reward(-3 * remainingMoves(gameReaction.board.cells));
  }

  return gameReaction;
}
