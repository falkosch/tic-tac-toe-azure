import fpTimes from 'lodash/fp/times';
import React from 'react';
import ReactDOM from 'react-dom';

import GameView from './GameView';

import { Game } from '../../meta-model/Game';
import { NoCellOwner, AnyCellOwner } from '../../meta-model/Cell';

describe(`${GameView.name}`, () => {
  let game: Game;

  beforeEach(() => {
    game = {
      board: {
        cells: fpTimes<AnyCellOwner>(() => NoCellOwner)(9),
        height: 3,
        width: 3,
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
