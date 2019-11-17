import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';
import { Consecutiveness } from './Game';

export interface GameReaction {
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
  winnerAnnouncement?: Readonly<SpecificCellOwner>;
}
