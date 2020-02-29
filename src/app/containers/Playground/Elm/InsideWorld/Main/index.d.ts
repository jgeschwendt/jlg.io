// WARNING: Do not manually modify this file. It was generated using:
// https://github.com/dillonkearns/elm-typescript-interop
// Type definitions for Elm ports

export namespace Elm {
  namespace Main {
    export interface App {
      ports: {
        increment: {
          send(data: number): void
        }
        reset: {
          send(data: {  }): void
        }
        store: {
          subscribe(callback: (data: unknown) => void): void
        }
        doRequest: {
          send(data: {  }): void
        }
      };
    }
    export function init(options: {
      node?: HTMLElement | null;
      flags: { catGifUrl: string | null; count: number; frame: number };
    }): Elm.Main.App;
  }
}