import { buildBoardModifier } from '../../mechanics/Actions';
import {
  buildNormalizedStateSpace,
  findDecisionForStateSpace,
  AIAgent,
  NormalizedStateSpace,
} from '../ai-agent/AIAgent';
import { countPoints } from '../../mechanics/GameRules';
import { findConsecutiveness } from '../../mechanics/Consecutiveness';
import { transformBoardCells } from '../../mechanics/BoardNormalization';
import { Board } from '../../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { Decision } from '../ai-agent/Decision';

export interface ReinforcedStateSpace extends NormalizedStateSpace {
  states: ReadonlyArray<number>;
}

export interface ReinforcedAgent extends AIAgent<ReinforcedStateSpace> {
  reward(value: number): void;
}

function buildReinforcedStateSpace(
  agentCellOwner: Readonly<SpecificCellOwner>,
  board: Readonly<Board>,
): ReinforcedStateSpace {
  const normalizedStateSpace = buildNormalizedStateSpace(board);
  return {
    ...normalizedStateSpace,
    states: transformBoardCells(board, normalizedStateSpace.normalization)
      .map((cellOwner) => {
        if (cellOwner === CellOwner.None) {
          return 0.0;
        }
        if (cellOwner === agentCellOwner) {
          return 1.0;
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
  const sumAgentsPoints = Object.values(points)
    .reduce((sumPoints, agentPoints) => sumPoints + agentPoints, 0);
  return 2 * points[agentCellOwner] - sumAgentsPoints;
}

export async function findReinforcedDecision(
  agent: Readonly<ReinforcedAgent>,
  board: Readonly<Board>,
): Promise<Decision | null> {
  return findDecisionForStateSpace(
    agent,
    board.cells,
    buildReinforcedStateSpace(agent.cellOwner, board),
    async (decision) => {
      const value = rewardOfDecision(agent.cellOwner, board, decision);
      agent.reward(value);
    },
  );
}
