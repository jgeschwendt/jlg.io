import React, { Fragment, Suspense } from 'react';
import { RouteConfig, RouteConfigComponentProps, renderRoutes } from 'react-router-config';
import { BrowserRouter, Switch } from 'react-router-dom';

import { default as Home } from './pages/Home';

const ProjectEuler = React.lazy(() => import('./pages/ProjectEuler'));

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
        component: ProjectEuler,
        exact: true,
        path: '/project-euler',
      },
    ],
  },
];

export const App = (): JSX.Element => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Switch>
        {renderRoutes(routes)}
      </Switch>
    </Suspense>
  </BrowserRouter>
);
