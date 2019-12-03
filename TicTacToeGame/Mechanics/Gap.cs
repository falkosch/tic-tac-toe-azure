namespace Edu.Schwabe.TicTacToe.Mechanics
{
  public struct Gap : System.IEquatable<Gap>
  {
    public Gap(int cellAt, int spread)
    {
      CellAt = cellAt;
      Spread = spread;
    }

    public int CellAt { get; private set; }

    public int Spread { get; private set; }

    public override bool Equals(object obj)
    {
      if (!(obj is Gap)) return false;
      return Equals((Gap)obj);
    }

    public bool Equals(Gap other)
    {
      return CellAt == other.CellAt && Spread == other.Spread;
    }

    public override int GetHashCode()
    {
      return (CellAt.GetHashCode() * 23) ^ Spread.GetHashCode();
    }

    public static bool operator ==(Gap left, Gap right)
    {
      return left.Equals(right);
    }

    public static bool operator !=(Gap left, Gap right)
    {
      return !(left == right);
    }
  }
}
