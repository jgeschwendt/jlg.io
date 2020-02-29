import * as React from 'react';
import { render } from 'react-dom';
import { App } from './app';

export default (id: string): void => {
  render(<App />, document.getElementById(id));
};
