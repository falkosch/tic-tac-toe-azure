import React from 'react';

import {
  AnyCellOwner, OCellOwner, XCellOwner, NoCellOwner,
} from '../../meta-model/Cell';

import './CellView.css';

import strokeNone from './stroke-none.svg';
import strokeO from './stroke-o.svg';
import strokeX from './stroke-x.svg';

function mapCellOwnerToImage(cellOwner: AnyCellOwner): string {
  const cellOwnersToImages = {
    [NoCellOwner]: strokeNone,
    [OCellOwner]: strokeO,
    [XCellOwner]: strokeX,
  };
  return cellOwnersToImages[cellOwner];
}

const CellView: React.FC<{ cellOwner: AnyCellOwner }> = ({ cellOwner }) => (
  <div className="cell-view">
    <img
      className="cell-view-cell-owner"
      src={mapCellOwnerToImage(cellOwner)}
      alt={cellOwner}
    />
  </div>
);

export default CellView;
