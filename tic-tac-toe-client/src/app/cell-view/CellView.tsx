import React, { useContext } from 'react';

import { cellCoordinates } from '../../mechanics/CellCoordinates';
import { cellEdgeClassifiers, EdgeClassifier } from '../../mechanics/CellEdgeClassifiers';
import { coveredConsecutivenessDirections } from '../../mechanics/Consecutiveness';
import { mapCellOwnerToImage, mapConsecutivenessDirectionToImage } from '../../mechanics/MapToImage';
import { BoardDimensions } from '../../meta-model/Board';
import { CellClickDispatch } from '../cell-actions/CellClickDispatch';
import { CellOwner } from '../../meta-model/CellOwner';
import { Consecutiveness } from '../../meta-model/GameView';

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
  consecutiveness: ReadonlyArray<Consecutiveness>;
}> = ({
  boardDimensions,
  cellAt,
  cellOwner,
  consecutiveness,
}) => {
  const cellActionsDispatch = useContext(CellClickDispatch);

  const cellOwnerImage = mapCellOwnerToImage(cellOwner);
  const consecutivenessDirectionImages = coveredConsecutivenessDirections(cellAt, consecutiveness)
    .map((d) => mapConsecutivenessDirectionToImage(d));

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
      className="cell-view position-relative bg-light border-secondary"
      onClick={() => cellActionsDispatch && cellActionsDispatch(cellAt)}
      style={gridStyle}
      type="button"
    >
      {
        cellOwnerImage && (
          <img className="d-block h-100 w-100" src={cellOwnerImage} alt={cellOwner} />
        )
      }
      {
        consecutivenessDirectionImages.map(
          (imageSrc, index) => {
            if (imageSrc === undefined) {
              return <></>;
            }

            const strikeKey = `d${index}`;
            return (
              <img
                key={strikeKey}
                className="d-block position-absolute cell-view-strike h-100 w-100"
                src={imageSrc}
                alt="Strike"
              />
            );
          },
        )
      }
    </button>
  );
};
