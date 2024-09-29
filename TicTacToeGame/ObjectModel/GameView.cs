using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class GameView
  {
    public Board Board { get; } = new Board();

    public IList<Consecutiveness> Consecutiveness { get; } = new List<Consecutiveness>();

    public IDictionary<SpecificCellOwner, double> Points { get; }
      = new Dictionary<SpecificCellOwner, double>
      {
        [SpecificCellOwner.O] = 0,
        [SpecificCellOwner.X] = 0
      };
  }
}
