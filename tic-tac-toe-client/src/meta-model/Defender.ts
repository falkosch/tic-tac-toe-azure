import { Game } from './Game';
import { GameAction } from './GameAction';
import { GameReaction } from './GameReaction';

export interface Defender {
    handshake(): Promise<Game>;
    defend(gameAction: GameAction): Promise<GameReaction>;
}
