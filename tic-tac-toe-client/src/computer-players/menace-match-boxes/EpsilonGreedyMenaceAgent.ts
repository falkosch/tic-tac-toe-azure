import {
  findFreeBeads,
  multiplyBeads,
  randomBead,
  MenaceAgent,
  MenaceStateSpace,
} from './MenaceAgent';
import { loadAgent, persistAgent } from '../ai-agent/StorableAgent';
import { takeAny, Decision } from '../ai-agent/Decision';
import { AIAgentCreator } from '../ai-agent/AIAgent';
import { CellOwner } from '../../meta-model/CellOwner';
import { StorableMenaceAgent } from './StorableMenaceAgent';
import { Brains } from './EpsilonGreedyMenacePretrainedBrain';

interface LearnPolicy {
  (beadsMemory: ReadonlyArray<number>, playedBead: number): number[];
}

const menaceAgents: Record<string, StorableMenaceAgent> = {};

const menaceObjectVersion = 2;

function newAgent(): StorableMenaceAgent {
  return {
    draws: 0,
    losses: 0,
    wins: 0,
    matchboxes: {},
    playedMoves: [],
  };
}

async function loadMenaceAgent(id: string): Promise<StorableMenaceAgent> {
  if (id in menaceAgents) {
    return menaceAgents[id];
  }

  const loadedBrain = await loadAgent<StorableMenaceAgent>(id, menaceObjectVersion, Brains[id]);
  const agent = loadedBrain || newAgent();
  menaceAgents[id] = agent;
  return agent;
}

function selectEpsilonGreedyAction(
  stateSpace: Readonly<MenaceStateSpace>,
  getMenaceMemory: () => StorableMenaceAgent,
): number {
  const { boardAsString } = stateSpace;
  const menaceMemory = getMenaceMemory();
  const beads = menaceMemory.matchboxes[boardAsString];

  if (beads.length > 0 && Math.random() > 0.05) {
    return randomBead(beads)[0];
  }

  const freeCellsAt = stateSpace.boardAsCellOwners
    .map((v, i) => (v === CellOwner.None ? i : -1))
    .filter(v => v >= 0);
  return takeAny(freeCellsAt)[0];
}

function populateMemory(
  stateSpace: Readonly<MenaceStateSpace>,
  getMenaceMemory: () => StorableMenaceAgent,
): void {
  const { boardAsString } = stateSpace;
  const menaceMemory = getMenaceMemory();
  if (!(boardAsString in menaceMemory.matchboxes)) {
    menaceMemory.matchboxes[boardAsString] = multiplyBeads(findFreeBeads(stateSpace));
  }
}

function learn(learnPolicy: LearnPolicy, getMenaceMemory: () => StorableMenaceAgent): void {
  const menaceMemory = getMenaceMemory();
  menaceMemory.playedMoves.forEach(playedMove => {
    const { boardAsString, bead } = playedMove;
    const beads = menaceMemory.matchboxes[boardAsString];
    const learnedBeads = learnPolicy(beads, bead);
    menaceMemory.matchboxes[boardAsString] = learnedBeads;
  });
  menaceMemory.playedMoves = [];
}

export const getMenaceAgent: AIAgentCreator<MenaceAgent> = async (cellOwner, boardDimensions) => {
  const id = `menace-${cellOwner}-${boardDimensions.width}x${boardDimensions.height}`;
  const menaceMemory = await loadMenaceAgent(id);

  async function persist(): Promise<void> {
    await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
  }

  /**
   * Encapsulates and persists the state of a Menace Matchbox "brain" and provides the interface
   * for the decision and bead "experience" interaction between {@link MenacePlayer} and this
   * agent. The actual Menace Matchbox implementation is based upon
   * {@link 'https://github.com/andrewmccarthy/menace'}.
   */
  return {
    cellOwner,

    async startNewGame(): Promise<void> {
      menaceMemory.playedMoves = [];
    },

    async decide(stateSpace): Promise<Decision> {
      const { boardAsString } = stateSpace;

      // Add first beads for still unknown game states
      populateMemory(stateSpace, () => menaceMemory);

      const bead = selectEpsilonGreedyAction(stateSpace, () => menaceMemory);

      menaceMemory.playedMoves.push({
        boardAsString,
        bead,
      });

      return {
        cellsAtToAttack: [bead],
      };
    },

    async rememberDraw(): Promise<void> {
      learn(
        (beads, playedBead) => [playedBead, ...beads],
        () => menaceMemory,
      );

      menaceMemory.draws += 1;
      await persist();
    },

    async rememberLoss(): Promise<void> {
      learn(
        (beads, playedBead) => {
          const playedIndex = beads.indexOf(playedBead);
          const learnedBeads = [...beads];
          if (playedIndex >= 0) {
            learnedBeads.splice(playedIndex, 1);
          }
          return learnedBeads;
        },
        () => menaceMemory,
      );

      menaceMemory.losses += 1;
      await persist();
    },

    async rememberWin(): Promise<void> {
      learn(
        (beads, playedBead) => [playedBead, playedBead, ...beads],
        () => menaceMemory,
      );

      menaceMemory.wins += 1;
      await persist();
    },
  };
};
