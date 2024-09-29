import { cellAtCoordinate, cellCoordinates } from '../../mechanics/CellCoordinates';
import {
  determineBoardNormalization,
  inverseNormalization,
  transformCoordinates,
  BoardNormalization,
} from '../../mechanics/BoardNormalization';
import { Board, BoardDimensions } from '../../meta-model/Board';
import { SpecificCellOwner } from '../../meta-model/CellOwner';
import { Decision } from './Decision';
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

export const buildNormalizedStateSpace = (board: Readonly<Board>): NormalizedStateSpace => {
  const normalization = determineBoardNormalization(board);
  return {
    dimensions: board.dimensions,
    inverseNormalization: inverseNormalization(normalization),
    normalization,
  };
};

const transformDecision = <StateSpaceType extends NormalizedStateSpace>(
  decisionForNormalizedStateSpace: Readonly<Decision>,
  stateSpace: Readonly<StateSpaceType>,
): Decision => {
  const cellsAtToAttack = decisionForNormalizedStateSpace.cellsAtToAttack.map(
    (cellAtForNormalizedStateSpace) =>
      cellAtCoordinate(
        transformCoordinates(
          cellCoordinates(cellAtForNormalizedStateSpace, stateSpace.dimensions),
          stateSpace.dimensions,
          stateSpace.inverseNormalization,
        ),
        stateSpace.dimensions,
      ),
  );

  return { ...decisionForNormalizedStateSpace, cellsAtToAttack };
};

export const findDecisionForStateSpace = async <StateSpaceType extends NormalizedStateSpace>(
  agent: Readonly<AIAgent<StateSpaceType>>,
  stateSpace: Readonly<StateSpaceType>,
): Promise<Decision | null> => {
  const decisionForNormalizedStateSpace = await agent.decide(stateSpace);
  return transformDecision(decisionForNormalizedStateSpace, stateSpace);
};

export const notifyEndState = <StateSpaceType extends NormalizedStateSpace>(
  endState: Readonly<GameEndState>,
  agent: Readonly<AIAgent<StateSpaceType>>,
): Promise<void> => {
  let promise = Promise.resolve();
  endState.visitee({
    drawEndState() {
      promise = agent.rememberDraw();
    },
    erroneousEndState() {
      promise = Promise.resolve();
    },
    oneWinnerEndState(winner) {
      if (winner === agent.cellOwner) {
        promise = agent.rememberWin();
      } else {
        promise = agent.rememberLoss();
      }
    },
  });
  return promise;
};
