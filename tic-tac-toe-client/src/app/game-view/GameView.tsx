import React from 'react';

import { BoardView } from '../board-view/BoardView';
import { Game } from '../../meta-model/Game';

export const GameView: React.FC<{ game: Game }> = ({ game }) => (
  <div className="d-flex justify-content-center align-items-center">
    <BoardView board={game.board} />
  </div>
);
