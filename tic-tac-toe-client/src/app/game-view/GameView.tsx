import React from 'react';
import { IsEmpty } from 'react-lodash';

import BoardView from '../board-view/BoardView';

import { Game } from '../../meta-model/Game';

import './GameView.css';

const GameView: React.FC<{ game: Game }> = ({ game }) => (
  <div className="game-view">
    <IsEmpty
      value={game}
      yes={() => (
        'Create a new game first.'
      )}
      no={() => (
        <BoardView board={game.board} />
      )}
    />
  </div>
);

export default GameView;
