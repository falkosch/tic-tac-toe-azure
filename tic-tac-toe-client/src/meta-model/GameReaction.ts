import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';
import { Consecutiveness } from './Game';

export enum EndState {
  Draw = 'draw',
  Lost = 'lost',
  Won = 'won',
}

export interface EndedGameReaction {
  endStates: Readonly<Record<SpecificCellOwner, EndState>>;
}

export interface GameReaction {
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
  endedReaction?: Readonly<EndedGameReaction>;
}
