import {
  DQNEnv, DQNOpt, DQNSolver, Solver,
} from 'reinforce-js';

import { BoardDimensions } from '../../meta-model/Board';
import { Decision, ReinforcedAgent, StateSpace } from './ReinforcedAgent';

export class DQNReinforcedAgent implements ReinforcedAgent {
  id: string;

  solver: Solver;

  constructor({ width, height }: Readonly<BoardDimensions>) {
    const cellCount = width * height;
    const actionCount = cellCount;
    const stateCount = cellCount;
    this.id = `dqn-${width}x${height}-${stateCount}-${actionCount}`;

    const agentEnvironment = new DQNEnv(width, height, stateCount, actionCount);
    const agentOptions = new DQNOpt();
    agentOptions.setEpsilonDecay(1.0, agentOptions.get('epsilon'), 100);

    this.solver = new DQNSolver(agentEnvironment, agentOptions);

    const storedDQN = localStorage.getItem(this.id);
    if (storedDQN === undefined || storedDQN === null) {
      localStorage.setItem(this.id, JSON.stringify(this.solver.toJSON()));
    } else {
      this.solver.fromJSON(JSON.parse(storedDQN));
    }
  }

  decide(prior: Readonly<StateSpace>): Decision {
    const action = this.solver.decide(prior.states);
    return {
      cellsAtToAttack: [action],
    };
  }

  reward(value: number): void {
    this.solver.learn(value);
    localStorage.setItem(this.id, JSON.stringify(this.solver.toJSON()));
  }
}
