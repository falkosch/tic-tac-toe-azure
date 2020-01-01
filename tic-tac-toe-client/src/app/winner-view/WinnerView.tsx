import React, { FC } from 'react';

import { CellOwner, SpecificCellOwner } from '../../meta-model/CellOwner';
import { Points } from '../../meta-model/GameView';

import styles from './WinnerView.module.scss';

function representsError(value: any): boolean {
  return value instanceof Error;
}

function representsAxiosError(value: any): boolean {
  return value && !!value.isAxiosError;
}

function representsDraw(value: any): boolean {
  return value === CellOwner.None;
}

function representsSpecificWinner(value: any): boolean {
  return value === CellOwner.O || value === CellOwner.X;
}

export const WinnerView: FC<{
  winner?: Readonly<CellOwner> | Error;
  wins: Readonly<Points>;
}> = ({
  winner,
  wins,
}) => (
  <div className={styles.view}>
    <div className={styles.error}>
      {
        representsError(winner) && representsAxiosError(winner) && (
          'Azure player is not available, because the backend is not reachable. Please try another player type.'
        )
      }
      {
        representsError(winner) && !representsAxiosError(winner) && (
          `Something unexpected happened: ${winner}`
        )
      }
    </div>
    <div className={styles.winner}>
      {
        representsDraw(winner) && (
          <>It&apos;s a draw!</>
        )
      }
      {
        representsSpecificWinner(winner) && (
          `Winner is ${winner} and has ${wins[winner as SpecificCellOwner]} wins so far.`
        )
      }
    </div>
  </div>
);
