import App from './Main.elm';

const app = App.Elm.Main.init({
  flags: {
    mode: 'development',
    value: 0,
    count: 0,
    conversations: [],
  },
});

const store = app.ports.store;

store.subscribe(([event, state]) => {
  console.log(`
    %o %o
  `, event, state);
});

const {
  increment,
} = app.ports;

increment.send({ amount: 5, value: 3 });
increment.send({ amount: 4 });
increment.send({ amount: 3 });
increment.send({ amount: 2 });
increment.send({ amount: 1 });



