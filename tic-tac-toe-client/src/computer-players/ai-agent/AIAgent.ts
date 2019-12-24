import { cellAtCoordinate, cellCoordinates } from '../../mechanics/CellCoordinates';
import { transformCoordinates, BoardNormalization } from '../../mechanics/BoardNormalization';
import { validateDecision, Decision } from './Decision';
import { BoardDimensions } from '../../meta-model/Board';
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
  normalization: Readonly<BoardNormalization>;
  inverseNormalization: Readonly<BoardNormalization>;
}

export interface AIAgent<StateSpaceType extends NormalizedStateSpace> {
  readonly cellOwner: Readonly<SpecificCellOwner>;
  decide(prior: Readonly<StateSpaceType>): Promise<Decision>;
  rememberDraw(): Promise<void>;
  rememberLoss(): Promise<void>;
  rememberWin(): Promise<void>;
}

export async function findDecisionForStateSpace<StateSpaceType extends NormalizedStateSpace>(
  agent: AIAgent<StateSpaceType>,
  cells: ReadonlyArray<CellOwner>,
  stateSpace: Readonly<StateSpaceType>,
  evaluateDecision: (decision: Readonly<Decision>) => Promise<void> = async () => {},
  invalidDecisionMaxRetries = 100,
): Promise<Decision | null> {
  const maxRetries = Math.max(1, invalidDecisionMaxRetries);

  for (let i = 0; i < maxRetries; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const decisionForNormalizedStateSpace = await agent.decide(stateSpace);
    const denormalizedDecision: Decision = {
      ...decisionForNormalizedStateSpace,
      cellsAtToAttack: decisionForNormalizedStateSpace.cellsAtToAttack.map(
        (cellAtForNormalizedStateSpace) => cellAtCoordinate(
          transformCoordinates(
            cellCoordinates(cellAtForNormalizedStateSpace, stateSpace.dimensions),
            stateSpace.dimensions,
            stateSpace.inverseNormalization,
          ),
          stateSpace.dimensions,
        ),
      ),
    };

    if (validateDecision(cells, denormalizedDecision)) {
      // eslint-disable-next-line no-await-in-loop
      await evaluateDecision(denormalizedDecision);
      return denormalizedDecision;
    }
  }

  return null;
}

export async function notifyEndState(endState: GameEndState, agent: AIAgent<any>): Promise<void> {
  if (endState.winner === undefined) {
    await agent.rememberDraw();
  } else if (endState.winner === agent.cellOwner) {
    await agent.rememberWin();
  } else if (endState.winner !== agent.cellOwner) {
    await agent.rememberLoss();
  }
}
