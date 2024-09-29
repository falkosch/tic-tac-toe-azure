import { cellAtCoordinate, cellCoordinates } from '../../mechanics/CellCoordinates';
import {
  determineBoardNormalization,
  inverseNormalization,
  transformCoordinates,
  BoardNormalization,
} from '../../mechanics/BoardNormalization';
import { validateDecision, Decision } from './Decision';
import { Board, BoardDimensions } from '../../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameEndState } from '../../meta-model/GameEndState';

export interface AIAgentCreator<AIAgentType> {
  (
    cellOwner: Readonly<SpecificCellOwner>,
    boardDimensions: Readonly<BoardDimensions>,
  ): Promise<AIAgentType>;
}

export interface NormalizedStateSpace {
  dimensions: Readonly<BoardDimensions>;
  inverseNormalization: Readonly<BoardNormalization>;
  normalization: Readonly<BoardNormalization>;
}

export interface AIAgent<StateSpaceType extends NormalizedStateSpace> {
  readonly cellOwner: Readonly<SpecificCellOwner>;
  decide(prior: Readonly<StateSpaceType>): Promise<Decision>;
  rememberDraw(): Promise<void>;
  rememberLoss(): Promise<void>;
  rememberWin(): Promise<void>;
}

export function buildNormalizedStateSpace(board: Readonly<Board>): NormalizedStateSpace {
  const normalization = determineBoardNormalization(board);
  return {
    dimensions: board.dimensions,
    inverseNormalization: inverseNormalization(normalization),
    normalization,
  };
}

function transformDecision<StateSpaceType extends NormalizedStateSpace>(
  decisionForNormalizedStateSpace: Readonly<Decision>,
  stateSpace: Readonly<StateSpaceType>,
): Decision {
  const cellsAtToAttack = decisionForNormalizedStateSpace.cellsAtToAttack.map(
    (cellAtForNormalizedStateSpace) => cellAtCoordinate(
      transformCoordinates(
        cellCoordinates(cellAtForNormalizedStateSpace, stateSpace.dimensions),
        stateSpace.dimensions,
        stateSpace.inverseNormalization,
      ),
      stateSpace.dimensions,
    ),
  );

  return { ...decisionForNormalizedStateSpace, cellsAtToAttack };
}

export async function findDecisionForStateSpace<StateSpaceType extends NormalizedStateSpace>(
  agent: Readonly<AIAgent<StateSpaceType>>,
  cells: ReadonlyArray<CellOwner>,
  stateSpace: Readonly<StateSpaceType>,
  evaluateDecision: (decision: Readonly<Decision>) => Promise<void> = async () => {},
  invalidDecisionMaxRetries = 100,
): Promise<Decision | null> {
  const maxRetries = Math.max(1, invalidDecisionMaxRetries);

  for (let i = 0; i < maxRetries; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const decisionForNormalizedStateSpace = await agent.decide(stateSpace);
    const decision = transformDecision(decisionForNormalizedStateSpace, stateSpace);

    if (validateDecision(cells, decision)) {
      // eslint-disable-next-line no-await-in-loop
      await evaluateDecision(decision);
      return decision;
    }
  }

  return null;
}

export async function notifyEndState<StateSpaceType extends NormalizedStateSpace>(
  endState: Readonly<GameEndState>,
  agent: Readonly<AIAgent<StateSpaceType>>,
): Promise<void> {
  const { winner } = endState;
  if (winner === CellOwner.None || winner instanceof Error) {
    await agent.rememberDraw();
  } else if (winner === agent.cellOwner) {
    await agent.rememberWin();
  } else if (winner !== agent.cellOwner) {
    await agent.rememberLoss();
  }
}
