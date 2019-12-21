import React from 'react';
import Program from './Main.elm';
import styled from 'styled-components';

import { ElmProvider, useElm } from './ElmProvider';

const Styled = styled.div`
  background-color: white;
  width: 100%;
`;

const initModel = {
  count: 0,
  frame: 1,
  response: '',
  loading: false,
  error: false,
  openSlot1: 0,
  openSlot2: 0,
};

const worker = Program.Elm.Main.init({ flags: initModel });

const App = () => {
  const [model, actions] = useElm();

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    actions.increment.send(1);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    actions.reset.send();
  };

  const handleDoRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    actions.doRequest.send();
  };

  return (
    <Styled>
      <button onClick={handleIncrement}>[+]</button>
      <button onClick={handleReset}>[-]</button>
      <button onClick={handleDoRequest}>[find cat]</button>
      <pre>{JSON.stringify(model, null, 2)}</pre>
    </Styled>
  );
};

export const Component = () => (
  <ElmProvider
    flags={initModel}
    ports={worker.ports}
  ><App />
  </ElmProvider>
);
