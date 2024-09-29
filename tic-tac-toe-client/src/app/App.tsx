import React from 'react';

import './App.css';

import logo from '../assets/logo.svg';

const App: React.FC = () => (
  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>Tic tac toe</p>
    </header>
  </div>
);

export default App;
