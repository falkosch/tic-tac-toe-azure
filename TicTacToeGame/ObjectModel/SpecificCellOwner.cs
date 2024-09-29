using System.Runtime.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  public enum SpecificCellOwner
  {
    [EnumMember(Value = "O")]
    O = 'O',

    [EnumMember(Value = "X")]
    X = 'X',
  }
}
