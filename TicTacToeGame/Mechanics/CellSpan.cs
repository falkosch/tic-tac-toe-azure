using System;

namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public struct CellSpan : System.IEquatable<CellSpan>
  {
    public CellSpan(int x, int y)
    {
      X = x;
      Y = y;
    }

    public int X { get; private set; }

    public int Y { get; private set; }

    public int Spread()
    {
      return Math.Max(Math.Abs(X), Math.Abs(Y));
    }

    public override bool Equals(object obj)
    {
      if (!(obj is CellSpan)) return false;
      return Equals((CellSpan)obj);
    }

    public bool Equals(CellSpan other)
    {
      return X == other.X && Y == other.Y;
    }

    public override int GetHashCode()
    {
      return (X.GetHashCode() * 23) ^ Y.GetHashCode();
    }

    public static bool operator ==(CellSpan left, CellSpan right)
    {
      return left.Equals(right);
    }

    public static bool operator !=(CellSpan left, CellSpan right)
    {
      return !(left == right);
    }
  }
}
