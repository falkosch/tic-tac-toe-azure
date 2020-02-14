import {
  buildNormalizedStateSpace,
  findDecisionForStateSpace,
  AIAgent,
  NormalizedStateSpace,
} from '../ai-agent/AIAgent';
import { transformBoardCells } from '../../mechanics/BoardNormalization';
import { Board } from '../../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { Decision } from '../ai-agent/Decision';

export interface ReinforcedStateSpace extends NormalizedStateSpace {
  states: ReadonlyArray<number>;
}

export type ReinforcedAgent = AIAgent<ReinforcedStateSpace>;

function buildReinforcedStateSpace(
  agentCellOwner: Readonly<SpecificCellOwner>,
  board: Readonly<Board>,
): ReinforcedStateSpace {
  const normalizedStateSpace = buildNormalizedStateSpace(board);
  return {
    ...normalizedStateSpace,
    states: transformBoardCells(board, normalizedStateSpace.normalization).map(cellOwner => {
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

export async function findReinforcedDecision(
  agent: Readonly<ReinforcedAgent>,
  board: Readonly<Board>,
): Promise<Decision | null> {
  return findDecisionForStateSpace(agent, buildReinforcedStateSpace(agent.cellOwner, board));
}
