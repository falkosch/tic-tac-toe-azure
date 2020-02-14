import React, { FC } from 'react';

import styles from './ImageStack.module.scss';

export const ImageStack: FC<{
  imageSources: ReadonlyArray<string | undefined>;
}> = ({ imageSources }) => (
  <div className={`${styles.top} position-absolute h-100 w-100`}>
    {imageSources
      .filter(v => !!v)
      .map((imageSource, index) => {
        const strikeKey = `d${index}`;
        return (
          <img
            key={strikeKey}
            className={`${styles.top} d-block position-absolute h-100 w-100`}
            src={imageSource}
            alt="Game element"
          />
        );
      })}
  </div>
);
