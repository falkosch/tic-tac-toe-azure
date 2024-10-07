import React, { FC, useContext } from 'react';

import { cellCoordinates } from '../../mechanics/CellCoordinates';
import { cellEdgeClassifiers, EdgeClassifier } from '../../mechanics/CellEdgeClassifiers';
import { coveredConsecutiveDirections } from '../../mechanics/Consecutiveness';
import { mapCellOwnerToImage, mapConsecutiveDirectionToImage } from '../../mechanics/MapToImage';
import { ActionTokenDispatch } from '../game-state/ActionTokenDispatch';
import { BoardDimensions } from '../../meta-model/Board';
import { CellOwner } from '../../meta-model/CellOwner';
import { Consecutive } from '../../meta-model/GameView';
import { ImageStack } from '../image-stack/ImageStack';

import styles from './CellView.module.scss';

const grid = {
  value: 0.25,
  unit: 'rem',
};

const tileSize = (dimension: number): string => {
  const innerGridSize = grid.value * (dimension - 1);
  return `calc((100% - ${innerGridSize}${grid.unit}) / ${dimension})`;
};

const selectBorderWidth = (upperEdge: boolean): string => {
  return upperEdge ? '0' : `${grid.value}${grid.unit}`;
};

export const CellView: FC<{
  boardDimensions: Readonly<BoardDimensions>;
  cellAt: number;
  cellOwner: Readonly<CellOwner>;
  consecutive: ReadonlyArray<Consecutive>;
}> = ({ boardDimensions, cellAt, cellOwner, consecutive }) => {
  const actionTokenDispatch = useContext(ActionTokenDispatch);

  const cellOwnerImage = mapCellOwnerToImage(cellOwner);
  const consecutiveDirectionImages = coveredConsecutiveDirections(cellAt, consecutive).map((d) =>
    mapConsecutiveDirectionToImage(d),
  );

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

  const onClick = (): void => {
    if (actionTokenDispatch) {
      actionTokenDispatch([cellAt]);
    }
  };

  return (
    <button className={className} onClick={onClick} style={gridStyle} type="button">
      <ImageStack imageSources={[cellOwnerImage, ...consecutiveDirectionImages]} />
    </button>
  );
};
