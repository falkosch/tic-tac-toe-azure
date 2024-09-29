export enum CellOwner {
    None = ' ',
    X = 'X',
    O = 'O',
}
export default CellOwner;

export type SpecificCellOwner = CellOwner.X | CellOwner.O;
