import fpEntries from 'lodash/fp/entries';
import fpFlow from 'lodash/fp/flow';
import fpMap from 'lodash/fp/map';
import React from 'react';

import { CellView } from '../cell-view/CellView';
import { Board } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

import './BoardView.css';

export const BoardView: React.FC<{
  board: Board;
  onCellClick: (event: React.MouseEvent, cellAt: number) => void;
}> = ({
  board,
  onCellClick,
}) => (
  <div className="board-view d-flex flex-row flex-wrap border-secondary bg-light p-2">
    {
      fpFlow(
        fpEntries,
        fpMap(
          ([key, cellOwner]: [string, CellOwner]) => {
            const cellAt = Number(key);
            return (
              <CellView
                key={key}
                boardDimensions={board.dimensions}
                cellAt={cellAt}
                cellOwner={cellOwner}
                onClick={(event) => onCellClick(event, cellAt)}
              />
            );
          },
        ),
      )(board.cells)
    }
  </div>
);
