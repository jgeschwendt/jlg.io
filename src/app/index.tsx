import React, { Fragment } from 'react';
import { RouteConfig, RouteConfigComponentProps, renderRoutes } from 'react-router-config';
import { BrowserRouter } from 'react-router-dom';

import { default as Home } from './containers/Home';
import { default as ElmPlayground } from './containers/Playground/Elm';
// import { default as MineSweeper } from './containers/Playground/ElmMineSweeper';

const RootTemplate = ({ route }: RouteConfigComponentProps): JSX.Element => (
  <Fragment>
    {renderRoutes(route.routes)}
  </Fragment>
);

export const routes: RouteConfig[] = [
  {
    component: RootTemplate,
    routes: [
      {
        component: Home,
        exact: true,
        path: '/',
      },
      {
        component: ElmPlayground,
        exact: true,
        path: '/playground/elm',
      },
      // {
      //   component: MineSweeper,
      //   exact: true,
      //   path: '/minesweeper',
      // },
    ],
  },
];

export const App = (): JSX.Element => (
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>
);
