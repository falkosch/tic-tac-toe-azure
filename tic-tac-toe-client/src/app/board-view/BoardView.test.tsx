import fpTimes from 'lodash/fp/times';
import React from 'react';
import ReactDOM from 'react-dom';

import BoardView from './BoardView';

import { Board } from '../../meta-model/Game';
import { NoCellOwner, AnyCellOwner } from '../../meta-model/Cell';

describe(`${BoardView.name}`, () => {
  let board: Board;

  beforeEach(() => {
    board = {
      cells: fpTimes<AnyCellOwner>(() => NoCellOwner)(9),
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
