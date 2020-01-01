import React from 'react';
import ReactDOM from 'react-dom';

import { ImageStack } from './ImageStack';

describe(`${ImageStack.name}`, () => {
  let imageSources: ReadonlyArray<string>;

  beforeEach(() => {
    imageSources = [];
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<ImageStack imageSources={imageSources} />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
