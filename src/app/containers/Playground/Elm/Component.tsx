import React from 'react';
import { App } from './App';
import { ElmProvider } from './ElmProvider';
import { Elm } from './InsideWorld/Main';

const initModel = {
  catGif: {
    data: null,
    error: null,
    loading: false,
  },
  count: 0,
  frame: 0,
};

export const Component = (): JSX.Element => {
  const program = Elm.Main.init({ flags: initModel });
  return (
    <ElmProvider flags={initModel} ports={program.ports}>
      <App />
    </ElmProvider>
  );
};
