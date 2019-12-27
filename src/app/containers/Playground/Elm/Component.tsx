import React from 'react';
import Program from './InsideWorld/Main.elm';
import styled from 'styled-components';

import { ElmProvider, useElm } from './ElmProvider';

const Styled = styled.div`
  background-color: white;
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

const ElmStateDebugger = styled.pre`
  background-color: white;
  bottom: 0;
  right: 0;
  position: absolute;
  width: 600px;
  height: 200px;
  border: 2px solid #eee;
  padding: 1rem;
  border-radius: .25rem;
  overflow: hidden;
  max-width: 100%;
`;

const Img = styled.div`
  background-size: cover;
  bottom: 250px;
  position: absolute;
  right: 45px;
  width: 300px;
  height: 300px;
`;

const Progress = styled.progress`
  display: block;
  width: 100%;
`;

const initModel = {
  catGifUrl: null,
  count: 0,
  frame: 1,
};

const worker = Program.Elm.Main.init({ flags: initModel });

const App = (): JSX.Element => {
  const [model, actions] = useElm();

  const handleIncrement = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.increment.send(1);
  };

  const handleReset = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.reset.send();
  };

  const handleDoRequest = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.doRequest.send();
  };

  return (
    <Styled>
      <Progress value={(model.frame / 100) % 60} max="60"></Progress>
      <Progress value={(model.frame / 90) % 60} max="60"></Progress>
      <Progress value={(model.frame / 80) % 60} max="60"></Progress>
      <Progress value={(model.frame / 70) % 60} max="60"></Progress>
      <Progress value={(model.frame / 60) % 60} max="60"></Progress>
      <Progress value={(model.frame / 50) % 60} max="60"></Progress>
      <Progress value={(model.frame / 40) % 60} max="60"></Progress>
      <Progress value={(model.frame / 30) % 60} max="60"></Progress>
      <Progress value={(model.frame / 20) % 60} max="60"></Progress>
      <div>{(model.frame / 100) % 60}</div>
      <div>
        {
          model.catGif &&
          model.catGif.data &&
          <Img style={{ backgroundImage: `url(${model.catGif.data})` }} />
        }
      </div>
      <button onClick={handleIncrement}>[+]</button>
      <button onClick={handleReset}>[-]</button>
      <button onClick={handleDoRequest}>[find cat]</button>
      <ElmStateDebugger>{JSON.stringify(model, null, 2)}</ElmStateDebugger>
    </Styled>
  );
};

export const Component = (): JSX.Element => (
  <ElmProvider
    flags={initModel}
    ports={worker.ports}
  ><App />
  </ElmProvider>
);
