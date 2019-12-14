using System.Runtime.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  public enum ConsecutivenessDirection
  {
    [EnumMember(Value = "H")]
    Horizontal,

    [EnumMember(Value = "V")]
    Vertical,

    [EnumMember(Value = "TR2BL")]
    DiagonalTR2BL,

    [EnumMember(Value = "TL2BR")]
    DiagonalTL2BR,
  }
}
