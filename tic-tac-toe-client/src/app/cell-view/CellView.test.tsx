import { render } from '@testing-library/react';
import React from 'react';

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
    render(
      <CellView
        boardDimensions={boardDimensions}
        cellAt={0}
        cellOwner={cellOwner}
        consecutiveness={[]}
      />,
    );
  });
});
