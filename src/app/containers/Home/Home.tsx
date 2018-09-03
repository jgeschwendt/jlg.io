import * as React from 'react'
import { CSSTransition } from 'react-transition-group'

import { App, Main, Statement } from './styles'
import Brand from './blocks/Brand'
import Languages from './blocks/Languages'
import Skills from './blocks/Skills'
import Social from './blocks/Social'

const statement = `
  I'm a seasoned software developer with eight years of professional experience from Grand Rapids, Michigan.
  I specialize in cloud-based Node.js services and React applications with a wide umbrella of web and data driven skill-sets.
  I take pride in the craftsmanship of my work and can't stand to leave a problem unsolved.
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
      <App>
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
          ><Statement className='statement'>{statement}</Statement>
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
      </App>
    )
  }
}
