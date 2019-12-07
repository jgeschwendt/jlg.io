import * as React from 'react';
import { CSSTransition } from 'react-transition-group';
import Brand from './blocks/Brand';
import LatestWork from './blocks/LatestWork';
import Statement from './blocks/Statement';
import Social from './blocks/Social';
import styled, { css, media } from '../../styled';

const LobotomizedOwl = styled.div`
  & > * + * { margin-top: 6rem; }

  ${media.breakpoint.up('md', css`
    & > * + * { margin-top: 8rem; }
  `)}
`;

const Main = styled.main`
  ${media.breakpoint.up('sm', css`
    margin: 4rem auto 4rem;
  `)}

  ${media.breakpoint.up('md', css`
    margin: 6rem auto 4rem;
  `)}

  ${media.breakpoint.up('lg', css`
    margin: 8rem auto 6rem;
  `)}

  .statement {
    opacity: 0;
    transform: translateY(1rem);
    transition: transform 700ms ease-in, opacity 1000ms ease-in;
  }

  .statement-enter-done {
    opacity: 1;
    transform: translateY(0rem);
    transition: transform 700ms ease-in, opacity 1000ms ease-in;
  }

  .latest-work {
    opacity: 0;
    transition: opacity 3s ease-in;
  }

  .latest-work-enter-done {
    opacity: 1;
    transition: opacity 3s ease-in;
  }

  .social {
    opacity: 0;
    transition: opacity 1s ease-in;
  }

  .social-enter-done {
    opacity: 1;
    transition: opacity 1s ease-in;
  }
`;

const Home = (): JSX.Element => {
  const [loading, setLoading] = React.useState(true);

  React.useLayoutEffect((): void => {
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

  return (
    <Main>
      <LobotomizedOwl>
        <CSSTransition classNames='brand' in={!loading} timeout={0}>
          <Brand className='brand' />
        </CSSTransition>
        <CSSTransition classNames='statement' in={!loading} timeout={2000}>
          <Statement className='statement' />
        </CSSTransition>
        <CSSTransition classNames='latest-work' in={!loading} timeout={2500}>
          <LatestWork className='latest-work'/>
        </CSSTransition>
        <CSSTransition classNames='social' in={!loading} timeout={3000}>
          <Social className='social' />
        </CSSTransition>
      </LobotomizedOwl>
    </Main>
  );
};

export default Home;
