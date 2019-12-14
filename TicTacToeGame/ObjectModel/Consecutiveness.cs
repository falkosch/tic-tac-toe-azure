using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class Consecutiveness
  {
    public Consecutiveness() => CellsAt = new List<int>();

    public Consecutiveness(IEnumerable<int> cellsAt) => CellsAt = new List<int>(cellsAt);

    public IList<int> CellsAt { get; private set; }

    public ConsecutivenessDirection Direction { get; set; }
  }
}
