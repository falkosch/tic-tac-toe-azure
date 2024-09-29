import React from 'react';

export interface CellClickDispatchType {
  (cellAt: number): void;
}

export const CellClickDispatch = React.createContext<null | CellClickDispatchType>(null);
