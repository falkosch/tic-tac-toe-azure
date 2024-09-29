using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;

namespace Edu.Schwabe.TicTacToe.ObjectModel
{
  [JsonObject(NamingStrategyType = typeof(CamelCaseNamingStrategy))]
  public class Board
  {
    [JsonProperty(ItemConverterType = typeof(StringEnumConverter))]
    public IList<CellOwner> Cells { get; } = new List<CellOwner>();

    public BoardDimensions Dimensions { get; } = new BoardDimensions();
  }
}
