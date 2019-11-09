import fpTimes from 'lodash/fp/times';
import React from 'react';
import ReactDOM from 'react-dom';

import BoardView from './BoardView';

import { CellOwner } from '../../meta-model/Cell';
import { Board } from '../../meta-model/Game';

describe(`${BoardView.name}`, () => {
  let board: Board;

  beforeEach(() => {
    board = {
      cells: fpTimes<CellOwner>(() => CellOwner.None)(9),
      height: 3,
      width: 3,
    };
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<BoardView board={board} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
