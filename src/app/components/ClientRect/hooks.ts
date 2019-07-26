import { throttle } from 'lodash';
import * as React from 'react';

export interface ClientRect {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

export const selectRefClientRect = (ref: React.MutableRefObject<HTMLDivElement>): ClientRect | object => {
  if (ref && ref.current) {
    // Cast the ClientRect to a standard javascript object for React usage.
    // https://stackoverflow.com/questions/42713229/why-are-properties-of-this-object-domrect-inaccessible-to-standard-javascript
    const { bottom, height, left, right, top, width } = ref.current.getBoundingClientRect();
    return { bottom, height, left, right, top, width };
  }

  return {};
};

export const subscribeToWindowResize = (listener: EventListener): React.EffectCallback => {
  const throttledListener = throttle(listener, 500);

  window.addEventListener('resize', throttledListener, false);
  return (): void => {
    window.removeEventListener('resize', throttledListener, false);
  };
};

export const useClientRect = (ref: React.MutableRefObject<HTMLDivElement>): ClientRect | object => {
  const [clientRect, setClientRect] = React.useState({});

  const setClientRectFromRef = (): void => {
    setClientRect(selectRefClientRect(ref));
  };

  React.useEffect(subscribeToWindowResize(setClientRectFromRef), [clientRect]);

  if (Object.keys(clientRect).length === 0 && ref.current) {
    setClientRectFromRef();
  }

  return clientRect;
};
