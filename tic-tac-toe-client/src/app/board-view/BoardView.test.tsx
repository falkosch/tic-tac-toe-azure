import React from 'react';
import ReactDOM from 'react-dom';

import { Board } from '../../meta-model/Board';
import { BoardView } from './BoardView';
import { CellOwner } from '../../meta-model/CellOwner';

describe(`${BoardView.name}`, () => {
  let board: Board;

  beforeEach(() => {
    board = {
      cells: [CellOwner.None],
      dimensions: {
        height: 1,
        width: 1,
      },
    };
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<BoardView board={board} consecutiveness={[]} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
