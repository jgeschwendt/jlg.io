import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes, RouteConfig } from 'react-router-config';

import { default as Home } from './containers/Home';
import { default as ElmPlayground } from './containers/Playground/Elm';
// import { default as MineSweeper } from './containers/Playground/ElmMineSweeper';

const RootTemplate = ({ route }: any): JSX.Element => (
  <div>
    {renderRoutes(route.routes)}
  </div>
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

export default () => (
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>
);
