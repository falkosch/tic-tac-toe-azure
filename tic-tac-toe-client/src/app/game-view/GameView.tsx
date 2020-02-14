import React, { FC } from 'react';

import { CellView } from '../cell-view/CellView';
import { GameView as ModelGameView } from '../../meta-model/GameView';

import styles from './GameView.module.scss';

export const GameView: FC<{
  gameView: Readonly<ModelGameView>;
}> = ({ gameView }) => (
  <div className={`${styles.view} d-flex flex-row flex-wrap border-secondary bg-light p-2`}>
    {gameView.board.cells.map((cellOwner, cellAt) => {
      const key = `c${cellAt}`;
      return (
        <CellView
          key={key}
          boardDimensions={gameView.board.dimensions}
          cellAt={cellAt}
          cellOwner={cellOwner}
          consecutiveness={gameView.consecutiveness}
        />
      );
    })}
  </div>
);
