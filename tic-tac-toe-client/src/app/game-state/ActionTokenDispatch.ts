import React from 'react';

export interface ActionTokenDispatchType {
  (cellsAt: ReadonlyArray<number>): void;
}

export const ActionTokenDispatch = React.createContext<ActionTokenDispatchType | undefined>(
  undefined,
);
