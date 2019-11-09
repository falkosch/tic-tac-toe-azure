import React from 'react';

import { CellOwner } from '../../meta-model/Cell';

import './CellView.css';

import strokeNone from './stroke-none.svg';
import strokeO from './stroke-o.svg';
import strokeX from './stroke-x.svg';

function mapCellOwnerToImage(cellOwner: CellOwner): string {
  const cellOwnersToImages = {
    [CellOwner.None]: strokeNone,
    [CellOwner.O]: strokeO,
    [CellOwner.X]: strokeX,
  };
  return cellOwnersToImages[cellOwner];
}

const CellView: React.FC<{ cellOwner: CellOwner }> = ({ cellOwner }) => (
  <div className="cell-view">
    <img
      className="cell-view-cell-owner"
      src={mapCellOwnerToImage(cellOwner)}
      alt={cellOwner}
    />
  </div>
);

export default CellView;
