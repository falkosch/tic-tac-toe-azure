import { CellOwner } from '../meta-model/CellOwner';

import strokeO from './assets/stroke-o.svg';
import strokeX from './assets/stroke-x.svg';

export function mapCellOwnerToImage(cellOwner: CellOwner): string {
  const cellOwnersToImages = {
    [CellOwner.O]: strokeO,
    [CellOwner.X]: strokeX,
  };
  return cellOwnersToImages[cellOwner];
}
