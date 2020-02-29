import React from 'react';


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Context {
}

export interface ContextType<ThisContext extends Context> {
  flags: ThisContext['flags'] & {};
  model: ThisContext['model'] & {};
  ports: ThisContext['ports'] & {};
}

const ElmContext = {
  Model: React.createContext(void 0),
  Ports: React.createContext(void 0),
};

function ElmProvider<T extends {
  children: any;
  flags?: Context['flags'];
  model?: Context['model'];
  ports?: Context['ports'] & { store: { subscribe: Function } };
}>({ children, flags, ports }: T): JSX.Element {
  const [model, updateModel] = React.useState<T['flags']>(flags);
  const { store, ...actions } = ports;

  React.useEffect(() => {
    store.subscribe(updateModel);

    return (): void => {
      (store as any).unsubscribe(updateModel);
    };
  }, [store]);

  return (
    <ElmContext.Model.Provider value={model as typeof flags}>
      <ElmContext.Ports.Provider value={actions as typeof ports}>
        {children}
      </ElmContext.Ports.Provider>
    </ElmContext.Model.Provider>
  );
}

function useElmModel<Model extends Context['model']>(): Model {
  const context = React.useContext(ElmContext.Model);
  if (context === undefined) {
    throw new Error('useElmModel must be used within a ElmProvider');
  }
  return context;
}

function useElmPorts<Ports extends Context['ports']>(): Ports {
  const context = React.useContext(ElmContext.Ports);
  if (context === undefined) {
    throw new Error('useElmPorts must be used within a ElmProvider');
  }
  return context;
}

function useElm<C extends Context>(): [C['model'], C['ports']] {
  return [useElmModel<C['model']>(), useElmPorts<C['ports']>()];
}

export { ElmProvider, useElm, useElmModel, useElmPorts };
