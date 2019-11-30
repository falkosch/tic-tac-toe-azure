import Form from 'react-bootstrap/Form';
import Navbar from 'react-bootstrap/Navbar';
import React from 'react';

import './AppNavbar.css';
import logo from './logo.svg';

export const AppNavbar: React.FC<{}> = ({ children }) => (
  <div className="app-navbar">
    <Navbar expand="lg" bg="light" variant="light">
      <Navbar.Brand href="/">
        <img className="app-logo d-inline-block align-top" src={logo} alt="logo" />
        <span> Tic Tac Toe with Azure</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Form inline>
          { children }
        </Form>
      </Navbar.Collapse>
    </Navbar>
  </div>
);
