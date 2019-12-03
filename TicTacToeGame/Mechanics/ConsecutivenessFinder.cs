using Edu.Schwabe.TicTacToe.ObjectModel;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using static System.Linq.Enumerable;

namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public static class ConsecutivenessFinder
  {
    private static void FindInCellOwnerSpans(
      Action<Consecutiveness> consecutivenessConsumer,
      Board board,
      int lineDimension,
      int minimumSpan,
      Func<int, CellCoordinates> iteratorToCoordinates)
    {
      // there are consecutiveness only if line dimension is big enough
      if (lineDimension < minimumSpan) return;

      // first cell is our pivot cell for the first span
      var pivotCellAt = CellCoordinates.ToCellAt(iteratorToCoordinates(0), board.Dimensions);

      // track spans of same CellOwners
      var cellsAt = new List<int>() { pivotCellAt };
      var ownerOfSpan = board.Cells[pivotCellAt];

      foreach (var index in Range(1, lineDimension - 1))
      {
        var iAsCellAt = CellCoordinates.ToCellAt(iteratorToCoordinates(index), board.Dimensions);
        var ownerAtCell = board.Cells[iAsCellAt];

        if (ownerOfSpan == ownerAtCell)
        {
          cellsAt.Add(iAsCellAt);
          continue;
        }
        // CellOwner changed, so span ended

        // add span as consecutiveness if it exceeds the minimum span length
        if (cellsAt.Count >= minimumSpan && ownerOfSpan != CellOwner.None)
          consecutivenessConsumer(new Consecutiveness(cellsAt));

        // start next span
        cellsAt = new List<int>() { iAsCellAt };
        ownerOfSpan = ownerAtCell;
      }

      // don't forget to check the last started span
      if (cellsAt.Count >= minimumSpan && ownerOfSpan != CellOwner.None)
        consecutivenessConsumer(new Consecutiveness(cellsAt));
    }

    private static void FindForEachLine(
      Action<Consecutiveness> consecutivenessConsumer,
      Board board,
      LineDimensions lineDimensions,
      int minimumSpan,
      Func<int, int, CellCoordinates> coordinatesFromIterators)
    {
      foreach (var j in Range(0, lineDimensions.J))
      {
        var lineDimensionAlongI = lineDimensions.I(j);

        CellCoordinates iteratorToCoordinates(int i) => coordinatesFromIterators(j, i);

        FindInCellOwnerSpans(
          consecutivenessConsumer,
          board,
          lineDimensionAlongI,
          minimumSpan,
          iteratorToCoordinates);
      }
    }

    public static IList<Consecutiveness> FindConsecutiveness(
      Board board,
      int minimumSpan = 3)
    {
      Contract.Requires(board != null);

      var maxDiagonalLength = Math.Min(board.Dimensions.Height, board.Dimensions.Width);
      var consecutiveness = new List<Consecutiveness>();
      Action<Consecutiveness> consecutivenessConsumer = (c) => consecutiveness.Add(c);

      // find consecutiveness in each horizontal span
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Height,
          (_) => board.Dimensions.Width),
        minimumSpan,
        (j, i) => new CellCoordinates(i, j));

      // find consecutiveness in each vertical span
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Width,
          (_) => board.Dimensions.Height),
        minimumSpan,
        (j, i) => new CellCoordinates(j, i));

      // find consecutiveness in each TL to BR diagonal span
      // - j iterates from TL to TR
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Width,
          (j) => Math.Min(maxDiagonalLength, board.Dimensions.Width - j)),
        minimumSpan,
        (j, i) => new CellCoordinates(j + i, i));

      // - j iterates from TL to BL
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Height - 1,
          (j) => Math.Min(maxDiagonalLength, board.Dimensions.Height - (j + 1))),
        minimumSpan,
        (j, i) => new CellCoordinates(i, (j + 1) + i));

      // find consecutiveness in each TR to BL diagonal span
      // - j iterates from TR to TL
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Width,
          (j) => Math.Min(maxDiagonalLength, board.Dimensions.Width - j)),
        minimumSpan,
        (j, i) => new CellCoordinates((board.Dimensions.Width - 1) - (j + i), i));

      // - j iterates from TR to BR
      FindForEachLine(
        consecutivenessConsumer,
        board,
        new LineDimensions(
          board.Dimensions.Height - 1,
          (j) => Math.Min(maxDiagonalLength, board.Dimensions.Height - (j + 1))),
        minimumSpan,
        (j, i) => new CellCoordinates((board.Dimensions.Width - 1) - i, (j + 1) + i));

      return consecutiveness;
    }
  }
}
