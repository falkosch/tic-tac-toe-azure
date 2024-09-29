import { render } from '@testing-library/react';
import React from 'react';

import { HumanPlayerStatusView } from './HumanPlayerStatusView';

describe(`${HumanPlayerStatusView.name}`, () => {
  it('renders without crashing', () => {
    render(<HumanPlayerStatusView />);
  });
});
