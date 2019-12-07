import React from 'react';
import { Component } from './Component';
import Program from './MineSweeperMain.elm';
console.log(Program);

const program = Program.Elm.MineSweeperMain.init({
  flags: {
    value: 0,
    count: 0,
  },
});

program.ports.store.subscribe((...event) => {
  console.log('event: ', event);
});

const tileLeftClick = program.ports.tileLeftClick.send;
const tileRightClick = program.ports.tileRightClick.send;

export default () => React.createElement(Component, {
  tileLeftClick,
  tileRightClick,
});
