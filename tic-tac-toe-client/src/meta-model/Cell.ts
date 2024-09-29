export const NoCellOwner = ' ';
export const XCellOwner = 'X';
export const OCellOwner = 'O';

export type SpecificCellOwner = typeof XCellOwner | typeof OCellOwner;
export type AnyCellOwner = typeof NoCellOwner | SpecificCellOwner;
