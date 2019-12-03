using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class BoardDimensions
  {
    public int Height { get; set; }

    public int Width { get; set; }
  }
}
