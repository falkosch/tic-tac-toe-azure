import React from 'react';

import { BoardView } from '../board-view/BoardView';
import { Game } from '../../meta-model/Game';

import './GameView.css';

export const GameView: React.FC<{ game: Game }> = ({ game }) => (
  <div className="game-view">
    <BoardView board={game.board} />
  </div>
);
