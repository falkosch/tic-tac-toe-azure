import fpTimes from 'lodash/fp/times';
import React from 'react';
import ReactDOM from 'react-dom';

import { GameView } from './GameView';
import { Game } from '../../meta-model/Game';
import { CellOwner } from '../../meta-model/CellOwner';

describe(`${GameView.name}`, () => {
  let game: Game;

  beforeEach(() => {
    game = {
      board: {
        cells: fpTimes(() => CellOwner.None)(1),
        dimensions: {
          height: 1,
          width: 1,
        },
      },
      consecutiveness: [],
    };
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<GameView game={game} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
