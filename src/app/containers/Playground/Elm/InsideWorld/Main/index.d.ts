// WARNING: Do not manually modify this file. It was generated using:
// https://github.com/dillonkearns/elm-typescript-interop
// Type definitions for Elm ports

export namespace Elm {
  namespace Main {
    export interface App {
      ports: {
        doRequest: {
          send(data: {  }): void
        }
        increment: {
          send(data: number): void
        }
        reset: {
          send(data: {  }): void
        }
        store: {
          subscribe(callback: (data: { catGif: { data: string | null; error: string | null; loading: boolean }; count: number; frame: number }) => void): void
        }
      };
    }
    export function init(options: {
      node?: HTMLElement | null;
      flags: { catGif: { data: string | null; error: string | null; loading: boolean }; count: number; frame: number };
    }): Elm.Main.App;
  }
}