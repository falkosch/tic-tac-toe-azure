import React from "react";
import logo from "./assets/logo.svg";
import "./App.css";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Tic tac toe</p>
      </header>
    </div>
  );
};

export default App;