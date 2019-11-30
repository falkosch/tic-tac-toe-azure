import { buildBoardModifier } from './Actions';
import { countPoints, isEnding, pointsLeader } from './GameRules';
import { findConsecutiveness } from './Consecutiveness';
import { Board, BoardDimensions } from '../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { GameActionHistory } from '../meta-model/GameActionHistory';
import { GameEndedState } from '../meta-model/GameEndedState';
import { GameView } from '../meta-model/GameView';
import { Player } from '../meta-model/Player';

export type JoiningPlayers = Record<SpecificCellOwner, Readonly<Player>>;

export interface OnGameViewUpdate {
  (gameView: Readonly<GameView>): void;
}

type JoinedPlayer = [SpecificCellOwner, Readonly<Player>];

const DefaultDimensions = Object.freeze({
  height: 3,
  width: 3,
});

function newBoard({ height, width }: Readonly<BoardDimensions>): Board {
  return {
    cells: Array.from({ length: height * width }).map(() => CellOwner.None),
    dimensions: {
      height,
      width,
    },
  };
}

function newGameView(): GameView {
  return {
    board: newBoard(DefaultDimensions),
    consecutiveness: [],
    points: {
      [CellOwner.O]: 0,
      [CellOwner.X]: 0,
    },
  };
}

function emptyActionHistory(): GameActionHistory {
  return {
    action: { affectedCellsAt: [] },
  };
}

function joinPlayers(joiningPlayers: Readonly<JoiningPlayers>): ReadonlyArray<JoinedPlayer> {
  return Object.entries(joiningPlayers) as ReadonlyArray<[SpecificCellOwner, Player]>;
}

function playerOfTurn(joinedPlayers: ReadonlyArray<JoinedPlayer>, turn: number): JoinedPlayer {
  const indexOfPlayerWithTurn = turn % joinedPlayers.length;
  return joinedPlayers[indexOfPlayerWithTurn];
}

function notifyGameViewUpdate(
  gameView: Readonly<GameView>,
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  onGameViewUpdate?: OnGameViewUpdate,
): void {
  if (onGameViewUpdate) {
    onGameViewUpdate(gameView);
  }

  joinedPlayers.forEach(
    (
      [cellOwner, { onGameViewUpdate: playerOnGameViewUpdate }],
    ) => {
      if (playerOnGameViewUpdate) {
        playerOnGameViewUpdate(cellOwner, gameView);
      }
    },
  );
}

export async function runNewGame(
  joiningPlayers: Readonly<JoiningPlayers>,
  onGameViewUpdate?: OnGameViewUpdate,
): Promise<GameEndedState> {
  const joinedPlayers = joinPlayers(joiningPlayers);

  let actionHistory = emptyActionHistory();
  let gameView = newGameView();
  let turn = 0;

  notifyGameViewUpdate(gameView, joinedPlayers, onGameViewUpdate);

  while (turn < 1000) {
    const [cellOwner, playerWithTurn] = playerOfTurn(joinedPlayers, turn);

    // eslint-disable-next-line
    const action = await playerWithTurn.takeTurn({ cellOwner, gameView: gameView, actionHistory });
    actionHistory = { action, previous: actionHistory };

    const boardModifier = buildBoardModifier(action, cellOwner);
    const board = boardModifier(gameView.board);
    const consecutiveness = findConsecutiveness(board);
    const points = countPoints(board, consecutiveness);
    gameView = { board, consecutiveness, points };
    notifyGameViewUpdate(gameView, joinedPlayers, onGameViewUpdate);

    if (isEnding(gameView)) {
      return {
        winner: pointsLeader(points),
      };
    }

    turn += 1;
  }

  return { };
}