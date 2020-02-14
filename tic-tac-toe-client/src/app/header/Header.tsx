import Navbar from 'react-bootstrap/Navbar';
import React, { FC } from 'react';

import logo from './logo.svg';

import styles from './Header.module.scss';

export const Header: FC<{}> = ({ children }) => (
  <div className={styles.header}>
    <Navbar fixed="top" expand="md" bg="light" variant="light">
      <Navbar.Brand href="https://github.com/falkosch/tic-tac-toe-azure">
        <img className={`${styles.logo} d-inline-block align-top`} src={logo} alt="logo" />
        <span> Tic Tac Toe Game</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">{children}</Navbar.Collapse>
    </Navbar>
  </div>
);
