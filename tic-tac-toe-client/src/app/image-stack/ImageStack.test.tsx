import { render } from '@testing-library/react';
import React from 'react';

import { ImageStack } from './ImageStack';

describe(`${ImageStack.name}`, () => {
  let imageSources: ReadonlyArray<string>;

  beforeEach(() => {
    imageSources = [];
  });

  it('renders without crashing', () => {
    render(<ImageStack imageSources={imageSources} />);
  });
});
