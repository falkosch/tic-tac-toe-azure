import { render } from '@testing-library/react';
import React from 'react';

import { App } from './App';

describe(`${App.name}`, () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
