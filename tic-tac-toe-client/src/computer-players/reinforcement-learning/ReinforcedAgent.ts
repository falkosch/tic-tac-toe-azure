import { buildBoardModifier } from '../../mechanics/Actions';
import { countPoints } from '../../mechanics/GameRules';
import { findConsecutiveness } from '../../mechanics/Consecutiveness';
import { Board } from '../../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameView } from '../../meta-model/GameView';

export interface StateSpace {
  states: ReadonlyArray<number>;
}

export interface Decision {
  cellsAtToAttack: ReadonlyArray<number>;
}

export interface ReinforcedAgent {
  readonly cellOwner: Readonly<SpecificCellOwner>;
  decide(prior: StateSpace): Decision;
  reward(value: number): void;
}

function buildStateSpace(
  agentCellOwner: Readonly<SpecificCellOwner>,
  gameView: Readonly<GameView>,
): StateSpace {
  return {
    states: [
      ...gameView.board.cells.map(
        (cellOwner) => {
          if (cellOwner === CellOwner.None) {
            return 1.0;
          }
          if (cellOwner === agentCellOwner) {
            return 0.0;
          }
          return -1.0;
        },
      ),
    ],
  };
}

function validateDecision(board: Readonly<Board>, decision: Readonly<Decision>): boolean {
  return decision.cellsAtToAttack.reduce<boolean>(
    (validAcc, cellAt) => {
      if (!validAcc) {
        return false;
      }
      return board.cells[cellAt] === CellOwner.None;
    },
    true,
  );
}

function boardValue(
  agentCellOwner: Readonly<SpecificCellOwner>,
  board: Readonly<Board>,
  lossOfMove = 0,
): number {
  const consecutiveness = findConsecutiveness(board);
  const points = countPoints(board, consecutiveness);
  const pointsEntries = Object.entries(points);
  const otherAgentsPoints = pointsEntries.reduce(
    (sumPoints, [__, agentPoints]) => sumPoints + agentPoints,
    0,
  );
  return Math.tanh(2 * points[agentCellOwner] - otherAgentsPoints - lossOfMove);
}

function rewardOfDecision(
  agentCellOwner: Readonly<SpecificCellOwner>,
  board: Readonly<Board>,
  decision: Readonly<Decision>,
): number {
  const boardModifier = buildBoardModifier(
    {
      affectedCellsAt: decision.cellsAtToAttack,
    },
    agentCellOwner,
  );
  const updatedBoard = boardModifier(board);
  return boardValue(agentCellOwner, updatedBoard, -0.1);
}

export function findDecision(
  gameView: Readonly<GameView>,
  agent: ReinforcedAgent,
): Decision | null {
  const stateSpace = buildStateSpace(agent.cellOwner, gameView);

  for (let i = 0; i < 100; i += 1) {
    const decision = agent.decide(stateSpace);

    if (validateDecision(gameView.board, decision)) {
      const value = rewardOfDecision(agent.cellOwner, gameView.board, decision);
      agent.reward(value);
      return decision;
    }

    // punish the agent for invalid decisions so that it learns from that and
    // selects different decision next time
    agent.reward(-10.0);
  }

  return null;
}
