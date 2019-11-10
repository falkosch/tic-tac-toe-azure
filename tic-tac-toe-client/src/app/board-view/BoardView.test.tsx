import fpTimes from 'lodash/fp/times';
import React from 'react';
import ReactDOM from 'react-dom';

import { BoardView } from './BoardView';

import { Board } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

describe(`${BoardView.name}`, () => {
  let board: Board;

  beforeEach(() => {
    board = {
      cells: fpTimes(() => CellOwner.None)(1),
      dimensions: {
        height: 1,
        width: 1,
      },
    };
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<BoardView board={board} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
