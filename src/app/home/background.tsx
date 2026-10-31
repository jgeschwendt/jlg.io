'use client';

import { type JSX, useEffect, useRef } from 'react';

// Module scope: the Bevy app boots once per session and owns this canvas for its
// lifetime — remounts re-adopt the node instead of spawning a second app.
const state: { canvas?: HTMLCanvasElement; loaded: boolean } = {
  loaded: false,
};

export function Background(): JSX.Element {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = container.current;

    if (
      wrapper !== null &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches &&
      document.createElement('canvas').getContext('webgl2') !== null
    ) {
      if (state.canvas === undefined) {
        state.canvas = document.createElement('canvas');
        state.canvas.id = 'bevy-bg';
        // winit focuses the canvas for keyboard input; hide the focus ring.
        state.canvas.classList.add('outline-none');
      }
      wrapper.append(state.canvas);

      if (!state.loaded) {
        state.loaded = true;
        // Runtime import so the wasm-bindgen glue in public/ stays out of the bundle; the
        // non-literal specifier keeps TS module resolution out of it.
        const specifier = '/background/background.js';
        void (async (): Promise<void> => {
          try {
            // The glue's shape is fixed by wasm-bindgen --target web: a default init export.
            const glue = await (import(
              // Bundler directives: Turbopack and webpack must leave this import to the browser.
              /*
              turbopackIgnore: true
              */
              /*
              webpackIgnore: true
              */
              specifier
            ) as Promise<{ default: () => Promise<unknown> }>);
            await glue.default();
          } catch {
            state.loaded = false;
          }
        })();
      }
    }

    return (): void => {
      state.canvas?.remove();
    };
  }, []);

  return <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" ref={container} />;
}
