using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class GameActionHistory
  {
    public AttackGameAction Action { get; } = new AttackGameAction();

    public GameActionHistory Previous { get; set; } = null;
  }
}
