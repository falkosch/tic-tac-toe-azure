import fpEntries from 'lodash/fp/entries';
import fpFlow from 'lodash/fp/flow';
import fpMap from 'lodash/fp/map';
import React from 'react';

import { CellView } from '../cell-view/CellView';
import { Board } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

import './BoardView.css';

export const BoardView: React.FC<{ board: Board }> = ({ board }) => (
  <div className="board-view">
    {
      fpFlow(
        fpEntries,
        fpMap(
          ([key, cellOwner]: [string, CellOwner]) => (
            <CellView
              key={key}
              cellOwner={cellOwner}
              cellAt={Number(key)}
              boardDimensions={board.dimensions}
            />
          ),
        ),
      )(board.cells)
    }
  </div>
);
