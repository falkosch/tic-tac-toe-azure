import React from 'react';
import ReactDOM from 'react-dom';

import { AppNavbar } from './AppNavbar';

describe(`${AppNavbar.name}`, () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<AppNavbar />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
