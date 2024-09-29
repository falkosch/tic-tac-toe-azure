import { buildBoardModifier } from './Actions';
import { countPoints, isEnding, pointsLeader } from './GameRules';
import { findConsecutiveness } from './Consecutiveness';
import { AttackGameAction } from '../meta-model/GameAction';
import { Board, BoardDimensions } from '../meta-model/Board';
import { CellOwner, SpecificCellOwner } from '../meta-model/CellOwner';
import { GameActionHistory } from '../meta-model/GameActionHistory';
import { GameEndState } from '../meta-model/GameEndState';
import { GameView } from '../meta-model/GameView';
import { Player, PlayerCreator } from '../meta-model/Player';

export type JoiningPlayers = Record<SpecificCellOwner, PlayerCreator>;

export interface OnGameStart {
  (gameView: Readonly<GameView>): Promise<void>;
}

export interface OnGameViewUpdate {
  (gameView: Readonly<GameView>): Promise<void>;
}

export interface OnGameEnd {
  (gameView: Readonly<GameView>, endState: Readonly<GameEndState>): Promise<void>;
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

async function joinPlayers(joiningPlayers: Readonly<JoiningPlayers>): Promise<JoinedPlayer[]> {
  const joiningPlayersEntries = Object.entries(joiningPlayers);
  const createPromises = joiningPlayersEntries
    .map<Promise<[SpecificCellOwner, Player]>>(
      async ([cellOwner, playerCreator]) => [cellOwner as SpecificCellOwner, await playerCreator()],
    );
  return Promise.all(createPromises);
}

function playerOfTurn(joinedPlayers: ReadonlyArray<JoinedPlayer>, turn: number): JoinedPlayer {
  const indexOfPlayerWithTurn = turn % joinedPlayers.length;
  return joinedPlayers[indexOfPlayerWithTurn];
}

async function notifyGameViewUpdate(
  gameView: Readonly<GameView>,
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  onGameViewUpdate?: OnGameViewUpdate,
): Promise<void> {
  if (onGameViewUpdate) {
    await onGameViewUpdate(gameView);
  }

  await Promise.all(
    joinedPlayers.map(
      async ([cellOwner, { onGameViewUpdate: playerOnGameViewUpdate }]) => {
        if (playerOnGameViewUpdate) {
          await playerOnGameViewUpdate(cellOwner, gameView);
        }
      },
    ),
  );
}

async function notifyGameStart(
  gameView: Readonly<GameView>,
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  onGameStart?: OnGameStart,
): Promise<void> {
  if (onGameStart) {
    await onGameStart(gameView);
  }

  await Promise.all(
    joinedPlayers.map(
      async ([cellOwner, { onGameStart: playerOnGameStart }]) => {
        if (playerOnGameStart) {
          await playerOnGameStart(cellOwner, gameView);
        }
      },
    ),
  );
}

async function notifyGameEnd(
  gameView: Readonly<GameView>,
  endState: Readonly<GameEndState>,
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  onGameEnd?: OnGameEnd,
): Promise<void> {
  if (onGameEnd) {
    await onGameEnd(gameView, endState);
  }

  await Promise.all(
    joinedPlayers.map(
      async ([cellOwner, { onGameEnd: playerOnGameEnd }]) => {
        if (playerOnGameEnd) {
          await playerOnGameEnd(cellOwner, gameView, endState);
        }
      },
    ),
  );
}

function effectiveMaxTurns(dimensions: BoardDimensions, maxTurns: number): number {
  const minTurnsRequired = dimensions.width * dimensions.height;
  return Math.max(minTurnsRequired, maxTurns);
}

function isWithdrawAction(action: Readonly<AttackGameAction>): boolean {
  return !action.affectedCellsAt || action.affectedCellsAt.length === 0;
}

export async function runNewGame(
  joiningPlayers: Readonly<JoiningPlayers>,
  onGameStart: OnGameStart = async () => {},
  onGameViewUpdate: OnGameViewUpdate = async () => {},
  onGameEnd: OnGameEnd = async () => {},
  maxTurns = 100,
): Promise<GameEndState> {
  const joinedPlayers = await joinPlayers(joiningPlayers);

  let actionHistory = emptyActionHistory();
  let gameView = newGameView();
  let turn = 0;
  let endState = { winner: CellOwner.None };

  await notifyGameStart(gameView, joinedPlayers, onGameStart);

  const turnsLimit = effectiveMaxTurns(gameView.board.dimensions, maxTurns);
  while (turn < turnsLimit) {
    const [cellOwner, playerWithTurn] = playerOfTurn(joinedPlayers, turn);

    let action: AttackGameAction;
    try {
      // eslint-disable-next-line no-await-in-loop
      action = await playerWithTurn.takeTurn({ cellOwner, gameView, actionHistory });
    } catch (e) {
      endState = { winner: e };
      break;
    }

    actionHistory = { action, previous: actionHistory };

    const boardModifier = buildBoardModifier(action, cellOwner);
    const board = boardModifier(gameView.board);
    const consecutiveness = findConsecutiveness(board);
    const points = countPoints(board, consecutiveness);
    gameView = { board, consecutiveness, points };
    // eslint-disable-next-line no-await-in-loop
    await notifyGameViewUpdate(gameView, joinedPlayers, onGameViewUpdate);

    if (isWithdrawAction(action) || isEnding(gameView)) {
      endState = { winner: pointsLeader(points) };
      break;
    }

    turn += 1;
  }

  await notifyGameEnd(gameView, endState, joinedPlayers, onGameEnd);
  return endState;
}
