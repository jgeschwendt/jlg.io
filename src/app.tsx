import React, { Fragment, Suspense, lazy } from 'react';
import { RouteConfig, RouteConfigComponentProps, renderRoutes } from 'react-router-config';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import { default as Home } from './pages/Home';

const ElmPlayground = lazy(() => import('./pages/Playground/Elm'));

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
    <Route component={Home} exact={true} path="/" />
    <Suspense fallback={null}>
      <Switch>
        {renderRoutes(routes)}
      </Switch>
    </Suspense>
  </BrowserRouter>
);
