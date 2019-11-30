import React from 'react';

import { BoardView } from '../board-view/BoardView';
import { GameView as ModelGameView } from '../../meta-model/GameView';

export const GameView: React.FC<{
  gameView: Readonly<ModelGameView>;
}> = ({
  gameView,
}) => (
  <div className="d-flex justify-content-center align-items-center">
    <BoardView board={gameView.board} />
  </div>
);
