import * as React from 'react';

export const Col = ({ children, ...props }): JSX.Element => (
  <div {...props}>{children}</div>
);

export const Container = ({ children, ...props }): JSX.Element => (
  <div {...props}>{children}</div>
);

export const Row = ({ children, ...props }): JSX.Element => (
  <div {...props}>{children}</div>
);
