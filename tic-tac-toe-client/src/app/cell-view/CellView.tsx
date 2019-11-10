import React from 'react';

import { cellCoordinates } from '../../mechanics/CellCoordinates';
import { cellEdgeClassifiers } from '../../mechanics/CellEdgeClassifiers';
import { mapCellOwnerToImage } from '../../mechanics/MapCellOwnerToImage';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';

import './CellView.css';

export const CellView: React.FC<{
  cellOwner: CellOwner;
  cellAt: number;
  boardDimensions: BoardDimensions;
}> = ({ cellOwner, cellAt, boardDimensions }) => {
  const cellOwnerImage = mapCellOwnerToImage(cellOwner);

  const edgeClassifiers = cellEdgeClassifiers(
    cellCoordinates(cellAt, boardDimensions),
    boardDimensions,
  );

  return (
    <div className={`cell-view cell-view-edge-${edgeClassifiers.x + edgeClassifiers.y}`}>
      {
        cellOwnerImage && (
          <img
            className="cell-view-cell-owner"
            src={cellOwnerImage}
            alt={cellOwner}
          />
        )
      }
    </div>
  );
};
