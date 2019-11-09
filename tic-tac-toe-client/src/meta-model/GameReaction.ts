import { SpecificCellOwner } from './Cell';
import { Board, Consecutiveness } from './Game';

export interface GameReaction {
    board: Board;
    consecutiveness: Consecutiveness[];
}

export enum EndState {
    Won = 'won',
    Lost = 'lost',
    Draw = 'draw',
}
export default EndState;

export interface GameEndsReaction extends GameReaction {
    endStates: Record<SpecificCellOwner, EndState>;
}
