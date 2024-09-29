import { CellOwner } from '../meta-model/CellOwner';
import { ConsecutivenessDirection } from '../meta-model/GameView';

import strikeHorizontal from './assets/strike-horizontal.svg';
import strikeTL2BR from './assets/strike-TL2BR.svg';
import strikeTR2BL from './assets/strike-TR2BL.svg';
import strikeVertical from './assets/strike-vertical.svg';

import strokeO from './assets/stroke-o.svg';
import strokeX from './assets/stroke-x.svg';

const cellOwnerToImage = Object.freeze({
  [CellOwner.None]: undefined,
  [CellOwner.O]: strokeO,
  [CellOwner.X]: strokeX,
});

const consecutivenessDirectionToImage = Object.freeze({
  [ConsecutivenessDirection.Horizontal]: strikeHorizontal,
  [ConsecutivenessDirection.Vertical]: strikeVertical,
  [ConsecutivenessDirection.DiagonalTL2BR]: strikeTL2BR,
  [ConsecutivenessDirection.DiagonalTR2BL]: strikeTR2BL,
});

export function mapCellOwnerToImage(cellOwner: Readonly<CellOwner>): string | undefined {
  return cellOwnerToImage[cellOwner];
}

export function mapConsecutivenessDirectionToImage(
  direction?: Readonly<ConsecutivenessDirection>,
): string | undefined {
  if (direction === undefined) {
    return undefined;
  }
  return consecutivenessDirectionToImage[direction];
}
