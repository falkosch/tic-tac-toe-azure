import React from 'react';

import { CellView } from '../cell-view/CellView';
import { Board } from '../../meta-model/Board';

import './BoardView.css';

export const BoardView: React.FC<{
  board: Readonly<Board>;
  onCellClick: (event: Readonly<React.MouseEvent>, cellAt: number) => void;
}> = ({
  board,
  onCellClick,
}) => (
  <div className="board-view d-flex flex-row flex-wrap border-secondary bg-light p-2">
    {
      board.cells.map((cellOwner, cellAt) => {
        const key = `c${cellAt}`;
        return (
          <CellView
            key={key}
            boardDimensions={board.dimensions}
            cellAt={cellAt}
            cellOwner={cellOwner}
            onClick={(event) => onCellClick(event, cellAt)}
          />
        );
      })
    }
  </div>
);
