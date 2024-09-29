import React, { FC } from 'react';

import { ActionTokenDispatch } from '../game-state/ActionTokenDispatch';
import { GameStateType } from '../game-state/GameState';
import { GameView } from '../game-view/GameView';
import { HumanPlayerStatusView } from '../human-player-status-view/HumanPlayerStatusView';
import { WinnerView } from '../winner-view/WinnerView';

import styles from './GameStateView.module.scss';

export const GameStateView: FC<{
  gameState: GameStateType;
}> = ({
  gameState,
}) => (
  <div className={`${styles.view} d-flex flex-column justify-content-center align-items-center`}>
    {
      !gameState.gameView && (
        <div className={styles.newGame}>
          Create a new game first.
        </div>
      )
    }
    {
      gameState.gameView && (
        <ActionTokenDispatch.Provider value={gameState.actionToken}>
          <GameView gameView={gameState.gameView} />
          <WinnerView winner={gameState.winner} wins={gameState.wins} />
          {
            !gameState.winner && (
              <HumanPlayerStatusView />
            )
          }
        </ActionTokenDispatch.Provider>
      )
    }
  </div>
);
