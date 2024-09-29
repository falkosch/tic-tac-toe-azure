import { SpecificCellOwner } from './Cell';
import { Board, Consecutiveness } from './Game';

export interface GameReaction {
    board: Board;
    consecutiveness: Consecutiveness[];
}

export const WonEndState = 'won';
export const LostEndState = 'lost';
export const DrawEndState = 'draw';

export type EndState = typeof WonEndState | typeof LostEndState | typeof DrawEndState;

export interface GameEndsReaction extends GameReaction {
    endStates: Record<SpecificCellOwner, EndState>;
}
