import * as React from 'react';
import { CSSTransition } from 'react-transition-group';

import { Main, Statement, StatementContainer } from './styles';
import Brand from './blocks/Brand';
// import Languages from './blocks/Languages';
import LatestWork from './blocks/LatestWork';
// import Skills from './blocks/Skills';
import Social from './blocks/Social';

const statement = `
  I'm a seasoned software engineer with seven years of professional experience located in Grand Rapids, Michigan.
  I specialize in cloud-based Node.js services and React applications with a wide umbrella of web and data-driven skill sets.
`;

interface HomeState {
  loading: boolean;
}

export default class Home extends React.Component<{}, HomeState> {
  public constructor(props) {
    super(props);
    this.state = { loading: true };
  }

  public componentDidMount(): void {
    /* eslint-disable no-undef */
    window.setTimeout((): void => this.setState({ loading: false }));
  }

  public render(): JSX.Element {
    return (
      <Main>
        <CSSTransition
          classNames='brand'
          in={!this.state.loading}
          timeout={0}
          unmountOnExit={true}
        ><Brand className='brand' />
        </CSSTransition>

        <CSSTransition
          classNames='statement'
          in={!this.state.loading}
          timeout={1000}
          unmountOnExit={true}
        >
          <StatementContainer className='statement'>
            <Statement>{statement}</Statement>
          </StatementContainer>
        </CSSTransition>

        <CSSTransition
          classNames='latest-work'
          in={!this.state.loading}
          timeout={1500}
          unmountOnExit={true}
        ><LatestWork className='latest-work'/>
        </CSSTransition>

        {/* <Skills /> */}
        {/* <Languages /> */}

        <CSSTransition
          classNames='social'
          in={!this.state.loading}
          timeout={2000}
          unmountOnExit={true}
        ><Social className='social' />
        </CSSTransition>
      </Main>
    );
  }
}
