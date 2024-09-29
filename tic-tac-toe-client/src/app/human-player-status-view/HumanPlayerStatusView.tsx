import React, { useContext, FC } from 'react';

import { ActionTokenDispatch } from '../game-state/ActionTokenDispatch';

import styles from './HumanPlayerStatusView.module.scss';

export const HumanPlayerStatusView: FC<{}> = () => {
  const actionTokenDispatch = useContext(ActionTokenDispatch);

  return (
    <div className={styles.view}>
      {
        actionTokenDispatch
          ? 'It is your turn! Select a free cell.'
          : 'Other player is serving...'
      }
    </div>
  );
};
