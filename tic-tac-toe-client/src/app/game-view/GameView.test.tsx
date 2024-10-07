import { render } from '@testing-library/react';
import React from 'react';

import { CellOwner } from '../../meta-model/CellOwner';
import { GameView } from './GameView';
import { GameView as ModelGameView } from '../../meta-model/GameView';

describe(`${GameView.name}`, () => {
  let gameView: ModelGameView;

  beforeEach(() => {
    gameView = {
      board: {
        cells: [CellOwner.None],
        dimensions: {
          height: 1,
          width: 1,
        },
      },
      consecutive: [],
      points: {
        [CellOwner.O]: 0,
        [CellOwner.X]: 0,
      },
    };
  });

  it('renders without crashing', () => {
    render(<GameView gameView={gameView} />);
  });
});
