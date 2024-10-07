import { GameView } from './GameView';
import { SpecificCellOwner } from './CellOwner';

export interface GameEndStateVisitor {
  drawEndState(moveLimitReached: boolean): void;

  oneWinnerEndState(winner: Readonly<SpecificCellOwner>): void;

  erroneousEndState(error: Readonly<Error>): void;
}

export interface GameEndStateVisit {
  (visitor: Readonly<Partial<GameEndStateVisitor>>): void;
}

export interface GameEndState {
  visit: GameEndStateVisit;
  gameView: Readonly<GameView>;
}
