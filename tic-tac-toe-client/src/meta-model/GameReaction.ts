import { Board } from './Board';
import { SpecificCellOwner } from './CellOwner';
import { Consecutiveness } from './Game';

export interface GameReaction {
    board: Board;
    consecutiveness: Consecutiveness[];
}

export enum EndState {
    Won = 'won',
    Lost = 'lost',
    Draw = 'draw',
}

export interface EndedGameReaction extends GameReaction {
    endStates: Record<SpecificCellOwner, EndState>;
}
