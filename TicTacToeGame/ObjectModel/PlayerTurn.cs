using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class PlayerTurn
  {
    public SpecificCellOwner CellOwner { get; set; }

    public GameView GameView { get; } = new GameView();

    public GameActionHistory ActionHistory { get; } = new GameActionHistory();
  }
}
