import React from 'react';
import ReactDOM from 'react-dom';

import { HumanPlayerStatusView } from './HumanPlayerStatusView';

describe(`${HumanPlayerStatusView.name}`, () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<HumanPlayerStatusView />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
