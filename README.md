Do you have too much time available in your life? Do you feel the need to play a childhood or retro game? Here it is. :)

~~Try it out on the [fstictactoe Azure Website](https://fstictactoe.azurewebsites.net).~~ Unfortunately my 30-day free trial subscription of my Azure account expired and both the client and the Azure function app services got disabled for now. [I hosted the client app on another hosting platform](https://tictactoe.iterative-prototyping.com), so that you at least can try out the "offline" version, unfortunately without the Azure function player.

It is an example application of a Tic Tac Toe game. It provides different player/opponent types for each of the two players:

* By default, you play as "Player X" and "Player O" will be played by an AI player.

* You can play against a second human player. Just select "Human player" for "Player X" and "Player O". With the other player, you rotate in making the noughts and crosses. You will have to share your mouse unfortunately. But that mode provides the good feeling and enjoyable experience of multiplayer mode the very old way.

* If you do not want to play with humans, you can still choose what player ("X" or "O") you want to control. Select "Human player" for the one that you want to control. Tip: Mathematically "Player X" has a big win-ratio advantage. Just saying.

* You can play against different types of AI players: Currently it is a DQN agent (a reinforcement learning supported neural network), a Menace Matchboxes agent or a reactive agent implemented as Azure Function.
  
  * DQN and Menace players must be trained first. You can let them play against each other. Just select DQN or Menace for both players.
  
  * The reactive agent must not be trained at all as it is stateless anyway. Though, you can still have it as an opponent for the DQN or the Menace agent to train them. However, you need a access to the internet and cannot play offline against the Azure Player.

  * Use the "Auto new game" option and start a new game to speed up training. Turn off the "Auto new game" option to stop training.

* There is another player type called `Mock computer player (local)`. That player randomly selects any free cell when it has turn.

## Status

[![Build Status](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_apis/build/status/falkosch.tic-tac-toe-azure%20TicTacToeGame?branchName=master)](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_build/latest?definitionId=1&branchName=master)

[![Build Status](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_apis/build/status/falkosch.tic-tac-toe-azure%20tic-tac-toe-client?branchName=master)](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_build/latest?definitionId=2&branchName=master)

## Implementation

The [client](./tic-tac-toe-client) is implemented with ReactJS.

The [Azure Function player type](./TicTacToeGame) is implemented in C# and .Net Core 2.2.

## Credits

The DQN player is implemented using [mvrahden's reinforce-js](https://github.com/mvrahden/reinforce-js).

The implementation of the Menace Matchboxes Engine is based upon [andrewmccarthy's Python version](https://github.com/andrewmccarthy/menace).
