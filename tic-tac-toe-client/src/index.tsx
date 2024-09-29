import React from 'react';
import ReactDOM from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

import * as serviceWorker from './serviceWorker';
import App from './app/App';

import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.register();
