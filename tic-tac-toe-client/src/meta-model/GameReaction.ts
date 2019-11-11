import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';
import { Consecutiveness } from './Game';

export enum EndState {
    Won = 'won',
    Lost = 'lost',
    Draw = 'draw',
}

export interface EndedGameReaction {
    endStates: Record<SpecificCellOwner, EndState>;
}

export interface GameReaction {
  board: Board;
  consecutiveness: Consecutiveness[];
  endedReaction?: EndedGameReaction;
}
