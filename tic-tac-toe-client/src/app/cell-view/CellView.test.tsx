import React from 'react';
import ReactDOM from 'react-dom';

import { CellView } from './CellView';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

describe(`${CellView.name}`, () => {
  let boardDimensions: BoardDimensions;
  let cellOwner: CellOwner;

  beforeEach(() => {
    boardDimensions = {
      height: 1,
      width: 1,
    };
    cellOwner = CellOwner.X;
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CellView
      boardDimensions={boardDimensions}
      cellAt={0}
      cellOwner={cellOwner}
      consecutiveness={[]}
    />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
