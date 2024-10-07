import { GameActionHistory } from './GameActionHistory';
import { GameView } from './GameView';
import { SpecificCellOwner } from './CellOwner';

export interface PlayerTurn {
  cellOwner: Readonly<SpecificCellOwner>;
  gameView: Readonly<GameView>;
  actionHistory?: Readonly<GameActionHistory>;
}
