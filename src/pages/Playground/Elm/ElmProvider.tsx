import React, { createContext, useContext, useEffect, useState } from 'react';
import { Elm } from './InsideWorld/Main';

export type Model = Parameters<Parameters<Elm.Main.App['ports']['store']['subscribe']>[0]>[0];
export type Ports = Elm.Main.App['ports'];

type ElmProviderProps = React.PropsWithChildren<{
  flags: Model;
  ports: Ports;
}>;

const ElmContext = {
  Model: createContext(void 0),
  Ports: createContext(void 0),
};

function ElmProvider({ children, flags, ports }: ElmProviderProps): JSX.Element {
  const [model, updateModel] = useState<Model>(flags);

  const { store, ...actions } = ports;

  useEffect(() => {
    store.subscribe(updateModel);

    return (): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      store.unsubscribe?.(updateModel);
    };
  }, [store]);

  return (
    <ElmContext.Model.Provider value={model}>
      <ElmContext.Ports.Provider value={actions}>
        {children}
      </ElmContext.Ports.Provider>
    </ElmContext.Model.Provider>
  );
}

function useElmModel<Flags>(): Flags {
  const context = useContext<Flags>(ElmContext.Model);
  if (context === undefined) {
    throw new Error('useElmModel must be used within a ElmProvider');
  }
  return context;
}

function useElmPorts(): Ports {
  const context = useContext<Ports>(ElmContext.Ports);
  if (context === undefined) {
    throw new Error('useElmPorts must be used within a ElmProvider');
  }
  return context;
}

function useElm(): [Model, Ports] {
  return [useElmModel(), useElmPorts()];
}

export { ElmProvider, useElm, useElmModel, useElmPorts };
