import { CellOwner } from './CellOwner';

export interface GameEndState {
  winner: Readonly<CellOwner> | Readonly<Error>;
}
