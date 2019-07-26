import * as React from 'react';
import { useClientRect } from './hooks';

export const ClientRect = (props): JSX.Element => {
  const ref: React.MutableRefObject<HTMLDivElement> = React.useRef();
  const children = useClientRect(ref);

  return (
    <div ref={ref}>{props.children(children)}</div>
  );
};
