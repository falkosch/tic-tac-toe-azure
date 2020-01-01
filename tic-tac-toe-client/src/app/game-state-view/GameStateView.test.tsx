import React from 'react';
import ReactDOM from 'react-dom';

import { CellOwner } from '../../meta-model/CellOwner';
import { GameStateType } from '../game-state/GameState';
import { GameStateView } from './GameStateView';

describe(`${GameStateView.name}`, () => {
  let gameState: GameStateType;

  beforeEach(() => {
    gameState = {
      wins: {
        [CellOwner.O]: 0,
        [CellOwner.X]: 0,
      },
    };
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<GameStateView gameState={gameState} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
