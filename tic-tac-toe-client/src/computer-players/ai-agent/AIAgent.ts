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

export interface AIAgent<StateSpaceType> {
  readonly cellOwner: Readonly<SpecificCellOwner>;
  decide(prior: Readonly<StateSpaceType>): Promise<Decision>;
  rememberDraw(): Promise<void>;
  rememberLoss(): Promise<void>;
  rememberWin(): Promise<void>;
}

export async function findDecisionForStateSpace<StateSpaceType>(
  agent: AIAgent<StateSpaceType>,
  cells: ReadonlyArray<CellOwner>,
  stateSpace: Readonly<StateSpaceType>,
  evaluateDecision: (decision: Readonly<Decision>) => Promise<void> = async () => {},
  invalidDecisionMaxRetries = 100,
): Promise<Decision | null> {
  const maxRetries = Math.max(1, invalidDecisionMaxRetries);

  for (let i = 0; i < maxRetries; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const decision = await agent.decide(stateSpace);

    if (validateDecision(cells, decision)) {
      // eslint-disable-next-line no-await-in-loop
      await evaluateDecision(decision);
      return decision;
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
