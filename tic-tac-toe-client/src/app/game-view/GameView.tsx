import React from 'react';

import { BoardView } from '../board-view/BoardView';
import { Game } from '../../meta-model/Game';

export const GameView: React.FC<{
  game: Readonly<Game>;
  onCellClick: (event: Readonly<React.MouseEvent>, cellAt: number) => void;
}> = ({
  game,
  onCellClick,
}) => (
  <div className="d-flex justify-content-center align-items-center">
    <BoardView
      board={game.board}
      onCellClick={(event, cellAt) => onCellClick(event, cellAt)}
    />
  </div>
);
