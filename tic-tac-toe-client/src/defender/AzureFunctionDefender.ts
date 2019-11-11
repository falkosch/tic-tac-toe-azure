import { Defender } from '../meta-model/Defender';
import { Game } from '../meta-model/Game';
import { GameAction } from '../meta-model/GameAction';
import { GameReaction } from '../meta-model/GameReaction';

/**
 * TODO Preliminary, actual implementation will call Azure Function at
 * fstictactoegame.azurewebsites.net
 */
export class AzureFunctionDefender implements Defender {
  handshake(): Promise<Game> {
    return Promise.reject(new Error('not implemented'));
  }

  defend(__gameAction: GameAction): Promise<GameReaction> {
    return Promise.reject(new Error('not implemented'));
  }
}