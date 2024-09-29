import React, { useContext, FC } from 'react';

import { cellCoordinates } from '../../mechanics/CellCoordinates';
import { cellEdgeClassifiers, EdgeClassifier } from '../../mechanics/CellEdgeClassifiers';
import { coveredConsecutivenessDirections } from '../../mechanics/Consecutiveness';
import { mapCellOwnerToImage, mapConsecutivenessDirectionToImage } from '../../mechanics/MapToImage';
import { ActionTokenDispatch } from '../game-state/ActionTokenDispatch';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';
import { Consecutiveness } from '../../meta-model/GameView';
import { ImageStack } from '../image-stack/ImageStack';

import styles from './CellView.module.scss';

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

export const CellView: FC<{
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
  const actionTokenDispatch = useContext(ActionTokenDispatch);

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

  const className = `${styles.view} position-relative bg-light border-secondary`;

  function onClick(): void {
    if (actionTokenDispatch) {
      actionTokenDispatch([cellAt]);
    }
  }

  return (
    <button className={className} onClick={onClick} style={gridStyle} type="button">
      <ImageStack imageSources={[cellOwnerImage, ...consecutivenessDirectionImages]} />
    </button>
  );
};
