import { cloneMatchboxes, StorableMenaceAgent } from './StorableMenaceAgent';
import {
  findFreeBeads, multiplyBeads, MenaceAgent, StateSpace, randomBead,
} from './MenaceAgent';
import { loadAgent, persistAgent } from '../ai-agent/StorableAgent';
import { BoardDimensions } from '../../meta-model/Board';
import { Decision } from '../ai-agent/Decision';
import { SpecificCellOwner } from '../../meta-model/CellOwner';

const agents: Record<string, StorableMenaceAgent> = {};

/**
 * Encapsulates and persists the state of a Menace Matchbox "brain" and provides the interface
 * for the decision and bead "experience" interaction between {@link MenacePlayer} and this agent.
 * The actual Menace Matchbox implementation is based upon
 * {@link 'https://github.com/andrewmccarthy/menace'}.
 */
export class DefaultMenaceAgent implements MenaceAgent {
  static ObjectVersion = 1;

  private id: string;

  private menaceMemory: StorableMenaceAgent;

  constructor(
    public cellOwner: SpecificCellOwner,
    { width, height }: Readonly<BoardDimensions>,
  ) {
    this.id = `menace-${this.cellOwner}-${width}x${height}`;
    this.menaceMemory = agents[this.id];

    if (!this.menaceMemory) {
      const stored = loadAgent<StorableMenaceAgent>(this.id, DefaultMenaceAgent.ObjectVersion);
      this.menaceMemory = stored || {
        draws: 0,
        losses: 0,
        wins: 0,
        longTermMatchboxes: {},
        matchboxes: {},
        playedMoves: [],
      };
      agents[this.id] = this.menaceMemory;
      this.persist();
    }
  }

  startNewGame(): void {
    // Clone the long term memory so that we can safely persist a running game for each move,
    // but do not poison the long term memory with never completed games
    this.menaceMemory.matchboxes = cloneMatchboxes(this.menaceMemory.longTermMatchboxes);
    this.menaceMemory.playedMoves = [];
    this.persist();
  }

  decide(stateSpace: Readonly<StateSpace>): Decision {
    const { boardAsString } = stateSpace;

    let memoryChanged = false;

    // Add first beads for still unknown game states
    if (!(boardAsString in this.menaceMemory.matchboxes)) {
      const freeBeads = findFreeBeads(stateSpace);
      const newBeads = multiplyBeads(freeBeads);
      this.menaceMemory.matchboxes[boardAsString] = newBeads;
      memoryChanged = true;
    }

    const cellsAtToAttack = [];

    const beads = this.menaceMemory.matchboxes[boardAsString];
    if (beads.length > 0) {
      const bead = randomBead(beads);
      this.menaceMemory.playedMoves.push({
        boardAsString,
        bead,
      });
      memoryChanged = true;

      cellsAtToAttack.push(bead);
    }

    if (memoryChanged) {
      this.persist();
    }
    return { cellsAtToAttack };
  }

  rememberDraw(): void {
    this.menaceMemory.draws += 1;
    this.menaceMemory.longTermMatchboxes = cloneMatchboxes(this.menaceMemory.matchboxes);
    this.menaceMemory.matchboxes = {};
    this.menaceMemory.playedMoves = [];
    this.persist();
  }

  rememberLoss(): void {
    this.menaceMemory.playedMoves.forEach(
      ({ boardAsString, bead }) => {
        const beads = this.menaceMemory.matchboxes[boardAsString];
        beads.splice(beads.indexOf(bead), 1);
      },
    );
    this.menaceMemory.losses += 1;
    this.menaceMemory.longTermMatchboxes = cloneMatchboxes(this.menaceMemory.matchboxes);
    this.menaceMemory.matchboxes = {};
    this.menaceMemory.playedMoves = [];
    this.persist();
  }

  rememberWin(): void {
    this.menaceMemory.playedMoves.forEach(
      ({ boardAsString, bead }) => this.menaceMemory.matchboxes[boardAsString].unshift(bead, bead),
    );
    this.menaceMemory.wins += 1;
    this.menaceMemory.longTermMatchboxes = cloneMatchboxes(this.menaceMemory.matchboxes);
    this.menaceMemory.matchboxes = {};
    this.menaceMemory.playedMoves = [];
    this.persist();
  }

  private persist(): void {
    persistAgent<StorableMenaceAgent>(this.id, DefaultMenaceAgent.ObjectVersion, this.menaceMemory);
  }
}
