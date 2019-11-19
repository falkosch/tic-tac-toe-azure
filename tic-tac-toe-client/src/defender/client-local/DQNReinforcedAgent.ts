import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { BoardDimensions } from '../../meta-model/Board';
import { Decision, ReinforcedAgent, StateSpace } from './ReinforcedAgent';

export class DQNReinforcedAgent implements ReinforcedAgent {
  solver: Solver;

  constructor(boardDimensions: Readonly<BoardDimensions>) {
    this.solver = DQNReinforcedAgent.createSolver(
      boardDimensions.width,
      boardDimensions.height,
    );
  }

  decide(prior: Readonly<StateSpace>): Decision {
    const action = this.solver.decide(prior.states);
    return {
      cellsAtToAttack: [action],
    };
  }

  reward(value: number): void {
    this.solver.learn(value);
  }

  static createSolver(width: number, height: number): Solver {
    const cellCount = width * height;
    const agentEnvironment = new DQNEnv(width, height, cellCount, cellCount);
    const agentOptions = new DQNOpt();
    return new DQNSolver(agentEnvironment, agentOptions);
  }
}
