Do you have too much time available in your life? Do you feel the need to play a childhood or retro game? Here it is. :)

~~Try it out on the [fstictactoe Azure Website](https://fstictactoe.azurewebsites.net).~~ Unfortunately my 30-day free trial subscription of my Azure account expired and both the client and the Azure function app services got disabled for now. [I hosted the client app on another hosting platform](https://tictactoe.iterative-prototyping.com), so that you can at least try out the "offline" version without the Azure function player.

The Tic Tac Toe game provides different player/opponent types for each of the two players:

* By default, you play as "Player X" and "Player O" will be played by an AI player.

* You can play against a second human player. Just select "Human player" for "Player X" and "Player O". With the other player, you both take turns in making the noughts and crosses. You will have to share your mouse unfortunately. However, this way provides you with the good feeling and enjoyable multiplayer experience the very old way.

* If you do not want to play with humans, you can still choose what player ("X" or "O") you want to control and set the other to an AI player. Tip: Mathematically "Player X" has a big win-ratio advantage. Just saying.

* You can play against different types of AI players: A DQN agent (a reinforcement learning supported neural network), a Menace Matchboxes agent or a reactive agent based on simple rules implemented as Azure Function.

  * ~~DQN and Menace players must be trained first.~~ For DQN and Menace, pretrained agent data is loaded. To train them even further, you can let them play against each other. Just select DQN or Menace for both players.

  * The reactive agent must not be trained at all as it is stateless anyway. Though, you can still have it as an opponent for the DQN or the Menace agent to train them. However, you need access to the internet and cannot play offline against the Azure Player.

  * Use the "Auto new game" option and start a new game to speed up training. Turn off the "Auto new game" option to stop training.

* There is another player type called `Random AI (local)`. That player randomly selects any free cell when it has turn.

## Status


Component | Status
--- | ---
**tic-tac-toe-client** | [![tic-tac-toe-client](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_apis/build/status/falkosch.tic-tac-toe-azure%20tic-tac-toe-client?branchName=master)](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_build/latest?definitionId=2&branchName=master) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tic-tac-toe&metric=alert_status)](https://sonarcloud.io/dashboard?id=tic-tac-toe) [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=tic-tac-toe&metric=coverage)](https://sonarcloud.io/dashboard?id=tic-tac-toe) [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=tic-tac-toe&metric=ncloc)](https://sonarcloud.io/dashboard?id=tic-tac-toe)
**TicTacToeGame** | [![TicTacToeGame](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_apis/build/status/falkosch.tic-tac-toe-azure%20TicTacToeGame?branchName=master)](https://falko-schwabe.visualstudio.com/tic-tac-toe-azure/_build/latest?definitionId=1&branchName=master)

## Implementation

The UI of the [client](./tic-tac-toe-client) is implemented with ReactJS. However, the game logic and the agents are implemented as being independent of React, so that it is easy to port it to other application frameworks as well.

The AI agents learn while you play with them. On a completed game, the altered state is persisted. Either the IndexedDB or the local storage of the web browser is selected as target storage. When you leave the website and return later on, the persisted state is loaded. When there is no persisted state for an agent, then the pretrained agent data is loaded.

The [Azure Function player type](./TicTacToeGame) is implemented in C# and .Net Core 2.2.

## Credits

The DQN player is implemented using [mvrahden's reinforce-js](https://github.com/mvrahden/reinforce-js).

The implementation of the Menace Agent is based upon [andrewmccarthy's Python version](https://github.com/andrewmccarthy/menace).
