import React from 'react';
import { Elm } from './InsideWorld/Main';
import { App } from './App';

import { ElmProvider } from './ElmProvider';


const initModel = {
  catGifUrl: null,
  count: 0,
  frame: 1,
};

const {ports} = Elm.Main.init({ flags: initModel });

declare module './ElmProvider' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends Required<{
    flags: typeof initModel;
    model: {
      catGif?: {
        data?: string;
      };
      frame: number;
    };
    ports: typeof ports;
  }> {}
}

export const Component = (): JSX.Element => (
  <ElmProvider flags={initModel} ports={ports}>
    <App />
  </ElmProvider>
);
