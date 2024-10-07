import { CellOwner } from '../meta-model/CellOwner';
import { ConsecutiveDirection } from '../meta-model/GameView';

import strikeHorizontal from './assets/strike-horizontal.svg';
import strikeTL2BR from './assets/strike-TL2BR.svg';
import strikeTR2BL from './assets/strike-TR2BL.svg';
import strikeVertical from './assets/strike-vertical.svg';

import strokeO from './assets/stroke-o.svg';
import strokeX from './assets/stroke-x.svg';

const cellOwnerToImage: Record<CellOwner, string | undefined> = {
  [CellOwner.None]: undefined,
  [CellOwner.O]: strokeO,
  [CellOwner.X]: strokeX,
} as const;

const consecutiveDirectionToImage: Record<ConsecutiveDirection, string> = {
  [ConsecutiveDirection.Horizontal]: strikeHorizontal,
  [ConsecutiveDirection.Vertical]: strikeVertical,
  [ConsecutiveDirection.DiagonalTL2BR]: strikeTL2BR,
  [ConsecutiveDirection.DiagonalTR2BL]: strikeTR2BL,
} as const;

export const mapCellOwnerToImage = (cellOwner: Readonly<CellOwner>): string | undefined =>
  cellOwnerToImage[cellOwner];

export const mapConsecutiveDirectionToImage = (
  direction?: Readonly<ConsecutiveDirection>,
): string | undefined =>
  direction === undefined ? undefined : consecutiveDirectionToImage[direction];
