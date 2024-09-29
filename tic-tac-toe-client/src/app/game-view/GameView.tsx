// @ts-ignore
import fpGet from 'lodash/fp/get';
import React from 'react';

import { Game } from '../../meta-model/Game';

import './GameView.css';

const GameView: React.FC<{ game: Game }> = ({ game }) => (
  <div className="game-view">
    {fpGet('board.height')(game)}
  </div>
);

export default GameView;
