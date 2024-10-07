import { render } from '@testing-library/react';
import React from 'react';

import { CellOwner } from '../../meta-model/CellOwner';
import { Points } from '../../meta-model/GameView';
import { WinnerView } from './WinnerView';

describe(`${WinnerView.name}`, () => {
  let winner: Readonly<CellOwner>;
  let wins: Readonly<Points>;

  beforeEach(() => {
    winner = CellOwner.X;
    wins = {
      [CellOwner.O]: 0,
      [CellOwner.X]: 0,
    };
  });

  it('renders without crashing', () => {
    render(<WinnerView winner={winner} wins={wins} />);
  });
});
