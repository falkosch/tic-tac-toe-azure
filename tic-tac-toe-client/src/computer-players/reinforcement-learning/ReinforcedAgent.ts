import { buildBoardModifier } from '../../mechanics/Actions';
import { countPoints } from '../../mechanics/GameRules';
import { findConsecutiveness } from '../../mechanics/Consecutiveness';
import { findDecisionForStateSpace, AIAgent } from '../ai-agent/AIAgent';
import { Board } from '../../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { Decision } from '../ai-agent/Decision';

export interface StateSpace {
  states: ReadonlyArray<number>;
}

export interface ReinforcedAgent extends AIAgent<StateSpace> {
  reward(value: number): void;
}

function buildStateSpace(
  agentCellOwner: Readonly<SpecificCellOwner>,
  cells: ReadonlyArray<CellOwner>,
): StateSpace {
  return {
    states: cells.map((cellOwner) => {
      if (cellOwner === CellOwner.None) {
        return 1.0;
      }
      if (cellOwner === agentCellOwner) {
        return 0.0;
      }
      return -1.0;
    }),
  };
}

function rewardOfDecision(
  agentCellOwner: Readonly<SpecificCellOwner>,
  board: Readonly<Board>,
  decision: Readonly<Decision>,
): number {
  const boardModifier = buildBoardModifier(
    { affectedCellsAt: decision.cellsAtToAttack },
    agentCellOwner,
  );
  const updatedBoard = boardModifier(board);
  const consecutiveness = findConsecutiveness(updatedBoard);
  const points = countPoints(updatedBoard, consecutiveness);
  const pointsEntries = Object.entries(points);
  const otherAgentsPoints = pointsEntries.reduce(
    (sumPoints, [__, agentPoints]) => sumPoints + agentPoints,
    0,
  );
  return Math.tanh(2 * points[agentCellOwner] - otherAgentsPoints);
}

export function findReinforcedDecision(
  agent: ReinforcedAgent,
  board: Readonly<Board>,
): Decision | null {
  return findDecisionForStateSpace(
    agent,
    board.cells,
    buildStateSpace(agent.cellOwner, board.cells),
    (decision) => {
      const value = rewardOfDecision(agent.cellOwner, board, decision);
      agent.reward(value);
    },
  );
}
