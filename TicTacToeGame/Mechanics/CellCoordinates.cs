using Edu.Schwabe.TicTacToe.ObjectModel;
using System.Diagnostics.Contracts;

namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public struct CellCoordinates : System.IEquatable<CellCoordinates>
  {
    public CellCoordinates(int x, int y)
    {
      X = x;
      Y = y;
    }

    public int X { get; private set; }

    public int Y { get; private set; }

    public static CellCoordinates Add(CellCoordinates left, CellSpan right)
    {
      return new CellCoordinates(left.X + right.X, left.Y + right.Y);
    }

    public static CellCoordinates Subtract(CellCoordinates left, CellSpan right)
    {
      return new CellCoordinates(left.X - right.X, left.Y - right.Y);
    }

    public static CellSpan Subtract(CellCoordinates left, CellCoordinates right)
    {
      return new CellSpan(left.X - right.X, left.Y - right.Y);
    }

    public static CellCoordinates operator +(CellCoordinates left, CellSpan right)
    {
      return Add(left, right);
    }

    public static CellCoordinates operator -(CellCoordinates left, CellSpan right)
    {
      return Subtract(left, right);
    }

    public static CellSpan operator -(CellCoordinates left, CellCoordinates right)
    {
      return Subtract(left, right);
    }

    public static bool IsInside(CellCoordinates cellCoordinates, BoardDimensions boardDimensions)
    {
      return IsInside(cellCoordinates.X, cellCoordinates.Y, boardDimensions);
    }

    public static bool IsInside(int x, int y, BoardDimensions boardDimensions)
    {
      Contract.Requires(boardDimensions != null);
      return x >= 0 && x < boardDimensions.Width
        && y >= 0 && y < boardDimensions.Height;
    }

    public static bool IsInside(int cellAt, BoardDimensions boardDimensions)
    {
      Contract.Requires(boardDimensions != null);
      return IsInside(cellAt, boardDimensions.Width * boardDimensions.Height);
    }

    public static bool IsInside(int cellAt, int cellsCount)
    {
      return cellAt >= 0 && cellAt < cellsCount;
    }

    public static CellCoordinates FromCellAt(int cellAt, BoardDimensions boardDimensions)
    {
      Contract.Requires(boardDimensions != null);
      return new CellCoordinates(cellAt % boardDimensions.Width, cellAt / boardDimensions.Width);
    }

    public static int ToCellAt(CellCoordinates cellCoordinates, BoardDimensions boardDimensions)
    {
      return ToCellAt(cellCoordinates.X, cellCoordinates.Y, boardDimensions);
    }

    public static int ToCellAt(int x, int y, BoardDimensions boardDimensions)
    {
      Contract.Requires(boardDimensions != null);
      return (y * boardDimensions.Width) + x;
    }

    public override bool Equals(object obj)
    {
      if (!(obj is CellCoordinates)) return false;
      return Equals((CellCoordinates)obj);
    }

    public bool Equals(CellCoordinates other)
    {
      return X == other.X && Y == other.Y;
    }

    public override int GetHashCode()
    {
      return (X.GetHashCode() * 23) ^ Y.GetHashCode();
    }

    public static bool operator ==(CellCoordinates left, CellCoordinates right)
    {
      return left.Equals(right);
    }

    public static bool operator !=(CellCoordinates left, CellCoordinates right)
    {
      return !(left == right);
    }
  }
}
