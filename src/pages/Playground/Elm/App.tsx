import React from 'react';
import styled from 'styled-components';
import { useElm } from './ElmProvider';

const Styled = styled.div`
  background-color: white;
  bottom: 0;
  left: 0;
  padding: 1rem;
  position: absolute;
  right: 0;
  top: 0;
`;

const ElmStateDebugger = styled.pre`
  background-color: white;
  border-radius: .25rem;
  border: 2px solid #eee;
  bottom: 0;
  height: 200px;
  max-width: 100%;
  overflow: hidden;
  padding: 1rem;
  position: absolute;
  right: 0;
  width: 600px;
`;

const Img = styled.div`
  background-size: cover;
  bottom: 250px;
  height: 300px;
  position: absolute;
  right: 45px;
  width: 300px;
`;

const Circle = styled.div`
	border-radius: 150px;
	border: 5px solid rgba(0, 0, 0, .7);
	height: 300px;
	position: relative;
  transform-origin: 50% 50%;
	width: 300px;

  &::after {
    content: "";
    background-color: rgba(0, 0, 0, 1);
    border-radius: 25px;
    height: 50px;
    left: 30px;
    position: absolute;
    top: 5px;
    width: 50px;
  }
`;

export const App = (): JSX.Element => {
  const [model, actions] = useElm();

  const handleIncrement = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.increment.send(1);
  };

  const handleReset = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.reset.send({});
  };

  const handleDoRequest = (e: React.MouseEvent): void => {
    e.preventDefault();
    actions.doRequest.send({});
  };

  return (
    <Styled>
      <Circle style={{ transform: `rotate(${(model.frame / 60) % 360}deg)`}}/>
      <pre>{(model.frame / 100) % 60}</pre>
      <pre>{(model.frame / 100)}</pre>
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
