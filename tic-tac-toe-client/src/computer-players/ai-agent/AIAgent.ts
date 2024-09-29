import { validateDecision, Decision } from './Decision';
import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { GameEndState } from '../../meta-model/GameEndState';

export interface AIAgentFactory<StateSpaceType> {
  (): AIAgent<StateSpaceType>;
}

export interface AIAgent<StateSpaceType> {
  readonly cellOwner: Readonly<SpecificCellOwner>;
  decide(prior: Readonly<StateSpaceType>): Decision;
  rememberDraw(): void;
  rememberLoss(): void;
  rememberWin(): void;
}

export function findDecisionForStateSpace<StateSpaceType>(
  agent: AIAgent<StateSpaceType>,
  cells: ReadonlyArray<CellOwner>,
  stateSpace: Readonly<StateSpaceType>,
  evaluateDecision: (decision: Readonly<Decision>) => void = () => {},
  invalidDecisionMaxRetries = 20,
): Decision | null {
  const maxRetries = Math.max(1, invalidDecisionMaxRetries);

  for (let i = 0; i < maxRetries; i += 1) {
    const decision = agent.decide(stateSpace);

    if (validateDecision(cells, decision)) {
      evaluateDecision(decision);
      return decision;
    }
  }

  return null;
}

export function notifyEndState(endState: GameEndState, agent: AIAgent<any>): void {
  if (endState.winner === undefined) {
    agent.rememberDraw();
  } else if (endState.winner === agent.cellOwner) {
    agent.rememberWin();
  } else if (endState.winner !== agent.cellOwner) {
    agent.rememberLoss();
  }
}
