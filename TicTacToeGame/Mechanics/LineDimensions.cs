using System;

namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public struct LineDimensions : IEquatable<LineDimensions>
  {
    public LineDimensions(int j, Func<int, int> i)
    {
      J = j;
      I = i;
    }

    public int J { get; private set; }

    public Func<int, int> I { get; private set; }

    public override bool Equals(object obj)
    {
      if (!(obj is LineDimensions)) return false;
      return Equals((LineDimensions)obj);
    }

    public bool Equals(LineDimensions other)
    {
      return J == other.J && I == other.I;
    }

    public override int GetHashCode()
    {
      return (J.GetHashCode() * 23) ^ I.GetHashCode();
    }

    public static bool operator ==(LineDimensions left, LineDimensions right)
    {
      return left.Equals(right);
    }

    public static bool operator !=(LineDimensions left, LineDimensions right)
    {
      return !(left == right);
    }
  }
}
