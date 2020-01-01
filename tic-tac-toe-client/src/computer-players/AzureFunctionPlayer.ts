import axios from 'axios';

import { AttackGameAction } from '../meta-model/GameAction';
import { PlayerCreator } from '../meta-model/Player';
import { PlayerTurn } from '../meta-model/PlayerTurn';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_NOT_SECRET_CODE,
});

export const createAzureFunctionPlayer: PlayerCreator = async () => (
  {
    /**
     * Posts the current game state in {@code playerTurn} to the Azure Function
     * {@code fstictactoegame}. The Azure function reacts on the game state by deciding for a
     * valuable action.
     */
    async takeTurn(playerTurn: Readonly<PlayerTurn>): Promise<AttackGameAction> {
      return (await axiosInstance.post('/api/takeTurn', playerTurn)).data;
    },
  }
);
