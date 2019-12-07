import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes, RouteConfig } from 'react-router-config';
import { default as Home } from './containers/Home';
import { default as MineSweeper } from './containers/Playground/ElmMineSweeper';

const Root = ({ route }: any): JSX.Element => (
  <div>
    {renderRoutes(route.routes)}
  </div>
);

export const routes: RouteConfig[] = [
  {
    component: Root,
    routes: [
      {
        component: Home,
        exact: true,
        path: '/',
      },
      {
        component: MineSweeper,
        exact: true,
        path: '/minesweeper',
      },
    ],
  },
];

export default () => (
  <BrowserRouter>
    {renderRoutes(routes)}
  </BrowserRouter>
);
