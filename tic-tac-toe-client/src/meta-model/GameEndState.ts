import { GameView } from './GameView';
import { SpecificCellOwner } from './CellOwner';

export interface GameEndStateVisitor {
  drawEndState(moveLimitReached: boolean): void;
  oneWinnerEndState(winner: Readonly<SpecificCellOwner>): void;
  erroneousEndState(error: Readonly<Error>): void;
}

export interface GameEndStateVisitee {
  (visitor: Readonly<Partial<GameEndStateVisitor>>): void;
}

export interface GameEndState {
  visitee: GameEndStateVisitee;
  gameView: Readonly<GameView>;
}
