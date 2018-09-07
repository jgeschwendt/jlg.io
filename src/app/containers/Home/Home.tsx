import * as React from 'react'
import { CSSTransition } from 'react-transition-group'

import { Main, Statement, StatementContainer } from './styles'
import Brand from './blocks/Brand'
import Languages from './blocks/Languages'
import Skills from './blocks/Skills'
import Social from './blocks/Social'

const statement = `
  I'm a seasoned software developer with seven years of professional experience from Grand Rapids, Michigan.
  I specialize in cloud-based Node.js services and React applications with a wide umbrella of web and data driven skill-sets.
`

export default class extends React.Component<any, any> {
  constructor (props) {
    super(props)
    this.state = { loading: true }
  }

  componentDidMount () {
    window.setTimeout(() => this.setState({ loading: false }))
  }

  render () {
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

        {/* <Skills /> */}
        {/* <Languages /> */}

        <CSSTransition
          classNames='social'
          in={!this.state.loading}
          timeout={1500}
          unmountOnExit={true}
        ><Social className='social' />
        </CSSTransition>

      </Main>
    )
  }
}
