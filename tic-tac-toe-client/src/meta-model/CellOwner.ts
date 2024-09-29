export enum CellOwner {
  None = ' ',
  X = 'X',
  O = 'O',
}

export type SpecificCellOwner = CellOwner.X | CellOwner.O;
