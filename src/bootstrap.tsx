import * as React from 'react';
import { render } from 'react-dom';
import App from './app';

export default (id: string): void => {
  /* eslint-disable-next-line no-undef */
  render(<App />, document.getElementById(id));
};
