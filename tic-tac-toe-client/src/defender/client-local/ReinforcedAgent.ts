import { countPoints } from '../../mechanics/GameRules';
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

export function boardValue(board: Readonly<Board>, lossOfMove = 0): number {
  const points = countPoints(board, findConsecutiveness(board));
  return Math.tanh(points[CellOwner.O] - points[CellOwner.X] - lossOfMove);
}

type CellUpdater = (cellOwner: Readonly<CellOwner>, cellAt: number) => CellOwner;

function buildCellUpdater(decision: Readonly<Decision>): CellUpdater {
  return (cellOwner, cellAt) => {
    if (decision.cellsAtToAttack.indexOf(cellAt) >= 0) {
      return CellOwner.O;
    }
    return cellOwner;
  };
}

function buildStateSpace(board: Readonly<Board>): StateSpace {
  return {
    states: [
      ...board.cells.map(
        (cellOwner) => {
          if (cellOwner === CellOwner.X) {
            return -1.0;
          }
          if (cellOwner === CellOwner.O) {
            return 1.0;
          }
          return 0.0;
        },
      ),
    ],
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

export function commenceReaction(
  gameReaction: Readonly<GameReaction>,
  agent: ReinforcedAgent,
): GameReaction {
  const stateSpace = buildStateSpace(gameReaction.board);

  for (let i = 0; i < 100; i += 1) {
    const decision = agent.decide(stateSpace);

    if (validateDecision(gameReaction.board, decision)) {
      const cellUpdater = buildCellUpdater(decision);
      const updatedBoard = {
        ...gameReaction.board,
        cells: gameReaction.board.cells.map(cellUpdater),
      };
      agent.reward(boardValue(updatedBoard, -1.0));

      return {
        ...gameReaction,
        board: updatedBoard,
      };
    }

    // punish the agent for invalid reactions so that it learns from that too
    agent.reward(-1);
  }

  return gameReaction;
}
