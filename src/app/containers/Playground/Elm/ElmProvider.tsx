import React from 'react';

const ElmModelContext = React.createContext(void 0);
const ElmPortsContext = React.createContext(void 0);

function ElmProvider({ children, flags, ports }) {
  const [model, setModel] = React.useState(flags);

  const { store, ...actions } = ports;

  React.useEffect(() => {
    store.subscribe((update: any) => {
      setModel(update);
    });

    return () => {
      store.unsubscribe(() => {
        console.log(arguments);
        debugger;
      });
    };
  }, [store]);

  return (
    <ElmModelContext.Provider value={model}>
      <ElmPortsContext.Provider value={actions}>
        {children}
      </ElmPortsContext.Provider>
    </ElmModelContext.Provider>
  );
}

function useElmModel() {
  const context = React.useContext(ElmModelContext);
  if (context === undefined) {
    throw new Error('useElmModel must be used within a ElmProvider');
  }
  return context;
}

function useElmPorts() {
  const context = React.useContext(ElmPortsContext);
  if (context === undefined) {
    throw new Error('useElmPorts must be used within a ElmProvider');
  }
  return context;
}

function useElm() {
  return [useElmModel(), useElmPorts()];
}

export {ElmProvider, useElm, useElmModel, useElmPorts};
