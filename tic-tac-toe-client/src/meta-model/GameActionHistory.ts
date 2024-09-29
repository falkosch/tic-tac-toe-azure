import { AttackGameAction } from './GameAction';

export interface GameActionHistory {
  action: Readonly<AttackGameAction>;
  previous?: Readonly<GameActionHistory>;
}
