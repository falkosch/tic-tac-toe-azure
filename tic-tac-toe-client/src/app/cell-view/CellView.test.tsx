import React from 'react';
import ReactDOM from 'react-dom';

import CellView from './CellView';

import { CellOwner } from '../../meta-model/Cell';

describe(`${CellView.name}`, () => {
  let cellOwner: CellOwner;

  beforeEach(() => {
    cellOwner = CellOwner.X;
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<CellView cellOwner={cellOwner} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
