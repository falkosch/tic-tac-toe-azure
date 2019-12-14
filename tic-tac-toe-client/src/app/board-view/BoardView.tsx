import React from 'react';

import { Board } from '../../meta-model/Board';
import { CellView } from '../cell-view/CellView';
import { Consecutiveness } from '../../meta-model/GameView';

import './BoardView.css';

export const BoardView: React.FC<{
  board: Readonly<Board>;
  consecutiveness: ReadonlyArray<Consecutiveness>;
}> = ({
  board,
  consecutiveness,
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
            consecutiveness={consecutiveness}
          />
        );
      })
    }
  </div>
);
