import { cloneMatchboxes, StorableMenaceAgent } from './StorableMenaceAgent';
import {
  findFreeBeads, multiplyBeads, randomBead, MenaceAgent,
} from './MenaceAgent';
import { loadAgent, persistAgent } from '../ai-agent/StorableAgent';
import { AIAgentCreator } from '../ai-agent/AIAgent';
import { Decision } from '../ai-agent/Decision';

const menaceAgents: Record<string, StorableMenaceAgent> = {};

const menaceObjectVersion = 2;

async function loadMenaceAgent(id: string): Promise<StorableMenaceAgent> {
  if (id in menaceAgents) {
    return menaceAgents[id];
  }

  const agent = await loadAgent<StorableMenaceAgent>(
    id,
    menaceObjectVersion,
    {
      draws: 0,
      losses: 0,
      wins: 0,
      longTermMatchboxes: {},
      matchboxes: {},
      playedMoves: [],
    },
  ) as StorableMenaceAgent;
  menaceAgents[id] = agent;
  await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, agent);
  return agent;
}

export const getMenaceAgent: AIAgentCreator<MenaceAgent> = async (
  cellOwner,
  boardDimensions,
) => {
  const id = `menace-${cellOwner}-${boardDimensions.width}x${boardDimensions.height}`;
  const menaceMemory = await loadMenaceAgent(id);

  /**
   * Encapsulates and persists the state of a Menace Matchbox "brain" and provides the interface
   * for the decision and bead "experience" interaction between {@link MenacePlayer} and this
   * agent. The actual Menace Matchbox implementation is based upon
   * {@link 'https://github.com/andrewmccarthy/menace'}.
   */
  return {
    cellOwner,

    async startNewGame(): Promise<void> {
      // Clone the long term memory so that we can safely persist a running game for each move,
      // but do not poison the long term memory with never completed games
      menaceMemory.matchboxes = cloneMatchboxes(menaceMemory.longTermMatchboxes);
      menaceMemory.playedMoves = [];
      await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
    },

    async decide(stateSpace): Promise<Decision> {
      const { boardAsString } = stateSpace;

      let memoryChanged = false;

      // Add first beads for still unknown game states
      if (!(boardAsString in menaceMemory.matchboxes)) {
        menaceMemory.matchboxes[boardAsString] = multiplyBeads(
          findFreeBeads(stateSpace),
        );
        memoryChanged = true;
      }

      const cellsAtToAttack: number[] = [];

      const beads = menaceMemory.matchboxes[boardAsString];
      if (beads.length > 0) {
        const bead = randomBead(beads)[0];
        menaceMemory.playedMoves.push({ boardAsString, bead });
        memoryChanged = true;

        cellsAtToAttack.push(bead);
      }

      if (memoryChanged) {
        await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
      }
      return { cellsAtToAttack };
    },

    async rememberDraw(): Promise<void> {
      menaceMemory.draws += 1;
      menaceMemory.longTermMatchboxes = cloneMatchboxes(menaceMemory.matchboxes);
      menaceMemory.matchboxes = {};
      menaceMemory.playedMoves = [];
      await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
    },

    async rememberLoss(): Promise<void> {
      menaceMemory.playedMoves.forEach(
        ({ boardAsString, bead }) => {
          const beads = menaceMemory.matchboxes[boardAsString];
          beads.splice(beads.indexOf(bead), 1);
        },
      );
      menaceMemory.losses += 1;
      menaceMemory.longTermMatchboxes = cloneMatchboxes(menaceMemory.matchboxes);
      menaceMemory.matchboxes = {};
      menaceMemory.playedMoves = [];
      await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
    },

    async rememberWin(): Promise<void> {
      menaceMemory.playedMoves.forEach(
        ({ boardAsString, bead }) => menaceMemory.matchboxes[boardAsString]
          .unshift(bead, bead),
      );
      menaceMemory.wins += 1;
      menaceMemory.longTermMatchboxes = cloneMatchboxes(menaceMemory.matchboxes);
      menaceMemory.matchboxes = {};
      menaceMemory.playedMoves = [];
      await persistAgent<StorableMenaceAgent>(id, menaceObjectVersion, menaceMemory);
    },
  };
};
