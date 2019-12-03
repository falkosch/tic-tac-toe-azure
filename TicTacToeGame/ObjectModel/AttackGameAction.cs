using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class AttackGameAction
  {
    public AttackGameAction() => AffectedCellsAt = new List<int>();

    public AttackGameAction(IEnumerable<int> affectedCellsAt)
      => AffectedCellsAt = new List<int>(affectedCellsAt);

    public IList<int> AffectedCellsAt { get; private set; }
  }
}
