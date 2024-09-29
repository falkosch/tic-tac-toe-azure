namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  public static class CellOwnerExtensions
  {
    public static CellOwner ToCellOwner(this SpecificCellOwner specificCellOwner)
    {
      if (specificCellOwner == SpecificCellOwner.O) return CellOwner.O;
      if (specificCellOwner == SpecificCellOwner.X) return CellOwner.X;
      return CellOwner.None;
    }
  }
}
