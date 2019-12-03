using Edu.Schwabe.TicTacToe.ObjectModel;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;

namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public static class Cells
  {
    private static readonly Random Rng = new Random();

    public static int[] TakeAnyFreeCell(Board board)
    {
      Contract.Requires(board != null);

      var cellsAt = new List<int>();

      for (int i = 0; i < board.Cells.Count; i++)
        if (board.Cells[i] == CellOwner.None)
          cellsAt.Add(i);

      return TakeAnyCell(cellsAt);
    }

    public static int[] TakeAnyFreeCellInRect(
      Board board,
      int cellAtTopLeft,
      int cellAtBottomRight)
    {
      Contract.Requires(board != null);

      var coordinateTopLeft = CellCoordinates.FromCellAt(cellAtTopLeft, board.Dimensions);
      var coordinateBottomRight = CellCoordinates.FromCellAt(cellAtBottomRight, board.Dimensions);
      var cellsAt = new List<int>();

      for (int y = coordinateTopLeft.Y; y <= coordinateBottomRight.Y; y++)
        for (int x = coordinateTopLeft.X; x <= coordinateBottomRight.X; x++)
        {
          if (!CellCoordinates.IsInside(x, y, board.Dimensions)) continue;

          var cellAt = CellCoordinates.ToCellAt(x, y, board.Dimensions);
          if (board.Cells[cellAt] == CellOwner.None)
            cellsAt.Add(cellAt);
        }

      return TakeAnyCell(cellsAt);
    }

    public static int[] TakeAnyCell(IList<int> cellsAt)
    {
      Contract.Requires(cellsAt != null);
      if (cellsAt.Count == 0) return Array.Empty<int>();
      return new int[] { cellsAt[Rng.Next(cellsAt.Count)] };
    }
  }
}
