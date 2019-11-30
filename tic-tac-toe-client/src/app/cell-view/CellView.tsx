import React, { useContext } from 'react';

import { cellCoordinates } from '../../mechanics/CellCoordinates';
import { cellEdgeClassifiers, EdgeClassifier } from '../../mechanics/CellEdgeClassifiers';
import { mapCellOwnerToImage } from '../../mechanics/MapCellOwnerToImage';
import { BoardDimensions } from '../../meta-model/Board';
import { CellClickDispatch } from '../cell-actions/CellClickDispatch';
import { CellOwner } from '../../meta-model/CellOwner';

import './CellView.css';

const grid = {
  value: 0.25,
  unit: 'rem',
};

function tileSize(dimension: number): string {
  const innerGridSize = grid.value * (dimension - 1);
  return `calc((100% - ${innerGridSize}${grid.unit}) / ${dimension})`;
}

function selectBorderWidth(upperEdge: boolean): string {
  return upperEdge ? '0' : `${grid.value}${grid.unit}`;
}

export const CellView: React.FC<{
  boardDimensions: Readonly<BoardDimensions>;
  cellAt: number;
  cellOwner: Readonly<CellOwner>;
}> = ({
  boardDimensions,
  cellAt,
  cellOwner,
}) => {
  const cellActionsDispatch = useContext(CellClickDispatch);

  const cellOwnerImage = mapCellOwnerToImage(cellOwner);

  const edgeClassifiers = cellEdgeClassifiers(
    cellCoordinates(cellAt, boardDimensions),
    boardDimensions,
  );

  const gridStyle = {
    borderRightWidth: selectBorderWidth(edgeClassifiers.x === EdgeClassifier.Upper),
    borderBottomWidth: selectBorderWidth(edgeClassifiers.y === EdgeClassifier.Upper),
    height: tileSize(boardDimensions.height),
    width: tileSize(boardDimensions.width),
  };

  return (
    <button
      className="cell-view bg-light border-secondary"
      onClick={() => cellActionsDispatch && cellActionsDispatch(cellAt)}
      style={gridStyle}
      type="button"
    >
      {
        cellOwnerImage && (
          <img className="d-block h-100 w-100" src={cellOwnerImage} alt={cellOwner} />
        )
      }
    </button>
  );
};
