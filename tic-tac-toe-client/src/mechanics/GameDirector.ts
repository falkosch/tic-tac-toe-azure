import { buildBoardModifier } from './Actions';
import {
  countPoints, isDrawEnding, isOneWinnerEnding, pointsLeader,
} from './GameRules';
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
  (endState: Readonly<GameEndState>): Promise<void>;
}

type JoinedPlayer = [Readonly<SpecificCellOwner>, Readonly<Player>];

const DefaultDimensions: Readonly<BoardDimensions> = {
  height: 3,
  width: 3,
};

function newBoard(boardDimensions: Readonly<BoardDimensions>): Board {
  const { height, width } = boardDimensions;
  return {
    cells: Array.from({ length: height * width })
      .map(() => CellOwner.None),
    dimensions: boardDimensions,
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
    action: {
      affectedCellsAt: [],
    },
  };
}

function effectiveMaxTurns(dimensions: Readonly<BoardDimensions>, maxTurns: number): number {
  const minTurnsRequired = dimensions.width * dimensions.height;
  return Math.max(minTurnsRequired, maxTurns);
}

function playerOfTurn(joinedPlayers: ReadonlyArray<JoinedPlayer>, turn: number): JoinedPlayer {
  const indexOfPlayerWithTurn = turn % joinedPlayers.length;
  return joinedPlayers[indexOfPlayerWithTurn];
}

async function joinPlayers(joiningPlayers: Readonly<JoiningPlayers>): Promise<JoinedPlayer[]> {
  const joiningPlayersEntries = Object.entries(joiningPlayers);
  const createPromises = joiningPlayersEntries
    .map<Promise<[SpecificCellOwner, Player]>>(
      async ([cellOwner, playerCreator]) => [cellOwner as SpecificCellOwner, await playerCreator()],
    );
  return Promise.all(createPromises);
}

function isWithdrawAction(action: Readonly<AttackGameAction>): boolean {
  return !action.affectedCellsAt || action.affectedCellsAt.length === 0;
}

function makeDrawEndState(gameView: Readonly<GameView>, moveLimitReached: boolean): GameEndState {
  return {
    gameView,
    visitee(visitor) {
      const { drawEndState } = visitor;
      if (drawEndState) {
        drawEndState(moveLimitReached);
      }
    },
  };
}

function makeOneWinnerEndState(gameView: Readonly<GameView>): GameEndState {
  const winner = pointsLeader(gameView.points);
  return {
    gameView,
    visitee(visitor) {
      const { oneWinnerEndState } = visitor;
      if (oneWinnerEndState && winner) {
        oneWinnerEndState(winner);
      }
    },
  };
}

function makeErroneousEndState(gameView: Readonly<GameView>, error: Readonly<Error>): GameEndState {
  return {
    gameView,
    visitee(visitor) {
      const { erroneousEndState } = visitor;
      if (erroneousEndState) {
        erroneousEndState(error);
      }
    },
  };
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
      async ([cellOwner, player]) => {
        const { onGameViewUpdate: playerOnGameViewUpdate } = player;
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
      async ([cellOwner, player]) => {
        const { onGameStart: playerOnGameStart } = player;
        if (playerOnGameStart) {
          await playerOnGameStart(cellOwner, gameView);
        }
      },
    ),
  );
}

async function notifyGameEnd(
  endState: Readonly<GameEndState>,
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  onGameEnd?: OnGameEnd,
): Promise<void> {
  if (onGameEnd) {
    await onGameEnd(endState);
  }

  await Promise.all(
    joinedPlayers.map(
      async ([cellOwner, player]) => {
        const { onGameEnd: playerOnGameEnd } = player;
        if (playerOnGameEnd) {
          await playerOnGameEnd(cellOwner, endState);
        }
      },
    ),
  );
}

async function runTurns(
  joinedPlayers: ReadonlyArray<JoinedPlayer>,
  initialGameView: Readonly<GameView>,
  onGameViewUpdate?: OnGameViewUpdate,
  maxTurns = 100,
): Promise<GameEndState> {
  let actionHistory = emptyActionHistory();
  let gameView = initialGameView;

  const turnsLimit = effectiveMaxTurns(gameView.board.dimensions, maxTurns);
  let turn = 0;
  while (turn < turnsLimit) {
    const [cellOwner, playerWithTurn] = playerOfTurn(joinedPlayers, turn);

    let action: AttackGameAction;
    try {
      // eslint-disable-next-line no-await-in-loop
      action = await playerWithTurn.takeTurn({ cellOwner, gameView, actionHistory });
    } catch (error) {
      return makeErroneousEndState(gameView, error);
    }

    actionHistory = { action, previous: actionHistory };

    const boardModifier = buildBoardModifier(action, cellOwner);
    const board = boardModifier(gameView.board);
    const consecutiveness = findConsecutiveness(board);
    const points = countPoints(board, consecutiveness);
    gameView = { board, consecutiveness, points };
    // eslint-disable-next-line no-await-in-loop
    await notifyGameViewUpdate(gameView, joinedPlayers, onGameViewUpdate);

    if (isWithdrawAction(action) || isDrawEnding(gameView)) {
      return makeDrawEndState(gameView, false);
    }

    if (isOneWinnerEnding(gameView)) {
      return makeOneWinnerEndState(gameView);
    }

    turn += 1;
  }

  return makeDrawEndState(gameView, true);
}

export async function runNewGame(
  joiningPlayers: Readonly<JoiningPlayers>,
  onGameStart?: OnGameStart,
  onGameViewUpdate?: OnGameViewUpdate,
  onGameEnd?: OnGameEnd,
  maxTurns?: number,
): Promise<GameEndState> {
  const joinedPlayers = await joinPlayers(joiningPlayers);

  const initialGameView = newGameView();
  await notifyGameStart(initialGameView, joinedPlayers, onGameStart);

  const endState = await runTurns(joinedPlayers, initialGameView, onGameViewUpdate, maxTurns);
  await notifyGameEnd(endState, joinedPlayers, onGameEnd);

  return endState;
}
