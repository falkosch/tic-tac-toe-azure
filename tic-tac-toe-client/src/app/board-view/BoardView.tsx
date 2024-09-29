import React from 'react';
import { Map } from 'react-lodash';

import CellView from '../cell-view/CellView';

import { Board } from '../../meta-model/Game';

import './BoardView.css';

const BoardView: React.FC<{ board: Board }> = ({ board }) => (
  <div className="board-view">
    <Map
      collection={board.cells}
      iteratee={(cellOwner, k) => (
        <CellView key={k} cellOwner={cellOwner} />
      )}
    />
  </div>
);

export default BoardView;
