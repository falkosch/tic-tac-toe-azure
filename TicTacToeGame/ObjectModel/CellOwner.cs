using System.Runtime.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  public enum CellOwner
  {
    [EnumMember(Value = " ")]
    None,

    [EnumMember(Value = "O")]
    O,

    [EnumMember(Value = "X")]
    X,
  }
}
