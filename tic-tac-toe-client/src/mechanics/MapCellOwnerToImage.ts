import { CellOwner } from '../meta-model/CellOwner';

import strokeO from './assets/stroke-o.svg';
import strokeX from './assets/stroke-x.svg';

const cellOwnersToImages = {
  [CellOwner.O]: strokeO,
  [CellOwner.X]: strokeX,
};

export function mapCellOwnerToImage(cellOwner: CellOwner): string | undefined {
  return cellOwnersToImages[cellOwner];
}
