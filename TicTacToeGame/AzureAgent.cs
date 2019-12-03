using Edu.Schwabe.TicTacToe.Mechanics;
using Edu.Schwabe.TicTacToe.ObjectModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Edu.Schwabe.TicTacToe
{
  public static class AzureAgent
  {
    [FunctionName("takeTurn")]
    public static async Task<IActionResult> Run(
      [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req)
    {
      Contract.Requires(req != null);

      using (var reader = new StreamReader(req.Body))
      {
        var requestBody = await reader.ReadToEndAsync().ConfigureAwait(false);
        var playerTurn = JsonConvert.DeserializeObject<PlayerTurn>(requestBody);
        var decision = Decide(playerTurn);
        return new OkObjectResult(JsonConvert.SerializeObject(decision));
      }
    }

    private static AttackGameAction Decide(PlayerTurn playerTurn)
    {
      // We need our common CellOwner to understand who took the current board cells
      var cellOwner = playerTurn.CellOwner.ToCellOwner();
      var board = playerTurn.GameView.Board;
      var cells = board.Cells;

      var incompleteMoves = FindIncompleteConsecutiveness(board);

      // First discover own winning moves that we could take, winning is priority number one
      {
        var ownWinningMoves = FindWinningMoves(board, incompleteMoves, (c) => c == cellOwner);
        if (ownWinningMoves.Count > 0)
          return new AttackGameAction(Cells.TakeAnyCell(ownWinningMoves));
      }

      // Prevent moves of the opponent, which would be a winning one. Not losing the next turn
      // is priority number two.
      {
        var otherWinningMoves = FindWinningMoves(board, incompleteMoves, (c) => c != cellOwner);
        if (otherWinningMoves.Count > 0)
          return new AttackGameAction(Cells.TakeAnyCell(otherWinningMoves));
      }

      // In early games, we have valuable opener moves that we should take first
      {
        var openerMoves = FindOpenerMoves(board);
        if (openerMoves.Count > 0)
          return new AttackGameAction(Cells.TakeAnyCell(openerMoves));
      }

      // Fallback to randomly select any free cell
      return new AttackGameAction(Cells.TakeAnyFreeCell(board));
    }

    private static IList<int> FindWinningMoves(
      Board board,
      IEnumerable<Consecutiveness> incompleteMoves,
      Predicate<CellOwner> cellOwnerPredicate)
    {
      var dimensions = board.Dimensions;
      var cells = board.Cells;
      var filteredIncompleteMoves = incompleteMoves.Where(
        (consecutiveness) => cellOwnerPredicate(cells[consecutiveness.CellsAt.First()]));

      // When there are moves, which could complete a winning consecutiveness on the board,
      // we should preferably take it.
      var completingMoves = CompleteConsecutiveness(board, filteredIncompleteMoves);
      if (completingMoves.Count > 0)
        return Cells.TakeAnyCell(completingMoves);

      // Gaps between taken cells could also complete a winning consecutiveness
      var gaps = new List<Gap>();
      var smallestSpread = int.MaxValue;
      for (int i = 0; i < cells.Count; i++)
      {
        // Skip cells which are not set (we find the gaps otherwise)
        // and skip cells which are not of interest for now
        var leftCellOwner = cells[i];
        if (leftCellOwner == CellOwner.None || !cellOwnerPredicate(leftCellOwner)) continue;

        // Bubble upwards and find a complementing cell of the same cellOwner
        var leftCoordinates = CellCoordinates.FromCellAt(i, dimensions);
        for (int j = i + 1; j < cells.Count; j++)
        {
          var rightCellOwner = cells[j];
          if (rightCellOwner != leftCellOwner) continue;

          // When the half distance between them is an integer (or distance from the middle to both
          // sides is equal), we have found a potential gap.
          var distance = j - i;
          var halfDistance = distance / 2;
          if (halfDistance + halfDistance != distance) continue;

          // The middle cell as gap must be claimable (only concerns boards bigger than 3x3)
          var middleCellAt = i + halfDistance;
          var middleCellOwner = cells[middleCellAt];
          if (middleCellOwner != CellOwner.None) continue;

          // Now we need to determine the spread between left cell and middle cell in terms of
          // board coordinates. This is actually only a priorization help for boards bigger than 3x3.
          // On 3x3 we will always have a spread of 1.
          var middleCoordinates = CellCoordinates.FromCellAt(middleCellAt, dimensions);
          var spread = (middleCoordinates - leftCoordinates).Spread();
          smallestSpread = Math.Min(smallestSpread, spread);

          gaps.Add(new Gap(middleCellAt, spread));
        }
      }

      // Gaps with smaller spread will be filled first
      var gapsWithSmallestSpread = gaps.Where((gap) => gap.Spread == smallestSpread)
        .Select((gap) => gap.CellAt);
      return Cells.TakeAnyCell(gapsWithSmallestSpread.ToList());
    }

    private static IList<int> FindOpenerMoves(Board board)
    {
      var dimensions = board.Dimensions;

      // The middle of a board is of highest priority.
      // account for a multi cell middle, e.g. width = 4, height = 3 => middle is at (1,1) and (2,1)
      var middleSpan = new CellSpan(1 - dimensions.Width % 2, 1 - dimensions.Height % 2);

      var step = new CellSpan(1, 1);
      for (
        CellCoordinates topLeft = new CellCoordinates(dimensions.Width / 2, dimensions.Height / 2),
          bottomRight = topLeft + middleSpan;
        CellCoordinates.IsInside(topLeft, dimensions)
          && CellCoordinates.IsInside(bottomRight, dimensions);
        topLeft -= step,
        bottomRight += step)
      {
        var cells = Cells.TakeAnyFreeCellInRect(
          board,
          CellCoordinates.ToCellAt(topLeft, dimensions),
          CellCoordinates.ToCellAt(bottomRight, dimensions));

        // If cells are already occupied, take a cell from the rectangle around the current one,
        if (cells.Length > 0)
          return cells;
        // repeat until a free cell is found.
      }

      return Array.Empty<int>();
    }

    private static IList<int> CompleteConsecutiveness(
      Board board,
      IEnumerable<Consecutiveness> incompleteMoves)
    {
      var cells = board.Cells;
      var boardDimensions = board.Dimensions;

      var moves = new List<int>();
      void collect(CellCoordinates coordinates)
      {
        if (CellCoordinates.IsInside(coordinates, boardDimensions))
        {
          var cellAt = CellCoordinates.ToCellAt(coordinates, boardDimensions);
          if (cells[cellAt] == CellOwner.None) moves.Add(cellAt);
        }
      }

      var prioritized = incompleteMoves
        .OrderByDescending(consecutiveness => consecutiveness.CellsAt.Count);
      foreach (var consecutiveness in prioritized)
      {
        // single moves cannot be completed in one turn
        if (consecutiveness.CellsAt.Count < 2) continue;

        var first = CellCoordinates.FromCellAt(consecutiveness.CellsAt.First(), boardDimensions);
        var second = CellCoordinates.FromCellAt(consecutiveness.CellsAt.Skip(1).First(), boardDimensions);
        var last = CellCoordinates.FromCellAt(consecutiveness.CellsAt.Last(), boardDimensions);
        var stepSpan = second - first;
        collect(first - stepSpan);
        collect(last + stepSpan);
      }

      return moves;
    }

    private static IEnumerable<Consecutiveness> FindIncompleteConsecutiveness(Board board)
    {
      return ConsecutivenessFinder.FindConsecutiveness(board, 2);
    }
  }
}
