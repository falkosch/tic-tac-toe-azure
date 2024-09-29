import React, { FC } from 'react';

import { ActionTokenDispatch } from '../game-state/ActionTokenDispatch';
import { GameStateType } from '../game-state/GameState';
import { GameView } from '../game-view/GameView';
import { HumanPlayerStatusView } from '../human-player-status-view/HumanPlayerStatusView';
import { WinnerView } from '../winner-view/WinnerView';

import styles from './GameStateView.module.scss';

export const GameStateView: FC<{
  gameState: GameStateType;
}> = ({ gameState }) => (
  <div className={`${styles.view} d-flex flex-column justify-content-center align-items-center`}>
    {!gameState.gameView && <div className={styles.newGame}>Create a new game first.</div>}
    {gameState.gameView && (
      <ActionTokenDispatch.Provider value={gameState.actionToken}>
        <div className="d-flex flex-column h-100">
          <div className="d-flex flex-fill justify-content-center align-items-center">
            <GameView gameView={gameState.gameView} />
          </div>
          <div className={`${styles.status} d-flex justify-content-center align-items-center`}>
            <WinnerView winner={gameState.winner} wins={gameState.wins} />
            {!gameState.winner && <HumanPlayerStatusView />}
          </div>
        </div>
      </ActionTokenDispatch.Provider>
    )}
  </div>
);
