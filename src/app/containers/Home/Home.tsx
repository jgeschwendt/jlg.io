import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import Brand from './blocks/Brand';
import LatestWork from './blocks/LatestWork';
import Statement from './blocks/Statement';
import Social from './blocks/Social';
import { Main } from './styles';
import { LobotomizedOwl } from '../../components';

const Home = (): JSX.Element => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect((): void => setLoading(false), [loading]);

  return (
    <Main>
      <LobotomizedOwl>
        <CSSTransition classNames='brand' in={!loading} timeout={0}>
          <Brand className='brand' />
        </CSSTransition>

        <CSSTransition classNames='statement' in={!loading} timeout={1000}>
          <Statement className='statement' />
        </CSSTransition>

        <CSSTransition classNames='latest-work' in={!loading} timeout={1500}>
          <LatestWork className='latest-work'/>
        </CSSTransition>

        <CSSTransition classNames='social' in={!loading} timeout={2000}>
          <Social className='social' />
        </CSSTransition>
      </LobotomizedOwl>
    </Main>
  );
};

export default Home;
