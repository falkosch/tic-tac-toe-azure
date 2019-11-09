import React from 'react';
import ReactDOM from 'react-dom';

import CellView from './CellView';

import { AnyCellOwner, XCellOwner } from '../../meta-model/Cell';

describe(`${CellView.name}`, () => {
  let cellOwner: AnyCellOwner;

  beforeEach(() => {
    cellOwner = XCellOwner;
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CellView cellOwner={cellOwner} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
