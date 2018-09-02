import * as React from 'react'
import styled from 'styled-components'

const App = styled.div`
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`

const Main = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`

const Logo = styled.div`
  display: block;
  margin: 2rem auto;
  padding: .5rem;
`

const LogoSvg = styled.svg`
  height: 6rem;
  width: 6rem;
`

const jlgPath = 'M140,20 L140,56 L104,20 L140,20 Z M88,20 L88,124 C59.281193,124 36,100.718807 36,72 C36,43.281193 59.281193,20 88,20 Z M88,176 L88,140 C96.836556,140 104,132.836556 104,124 L104,72 L140,72 L140,124 C140,152.718807 116.718807,176 88,176 Z'

const Statement = styled.p`
  color: rgba(255, 255, 255, .8);
  font-size: 1.25rem;
  font-weight: 100;
  letter-spacing: 1px;
  line-height: 1.5;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
  width: 100%;

  @media (min-width: 768px) {
    font-size: 2rem;
    width: 50%;
  }
`

const LinkDock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  margin: 2rem auto;
`

const LinkBlock = styled.a`
  color: rgba(255, 255, 255, .8);
  padding: 1rem;
  text-align: center;
  text-decoration: none;
`

const Icon: any = styled.i`
  display: block;
  font-size: 2rem;
  margin-bottom: .5rem;
`

const Text = styled.span`
  display: block;
  font-size: .8rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;

  @media (min-width: 768px) {
    letter-spacing: 2px;
  }
`

export default () => (
  <App>
    <Main>
      <Logo>
        <LogoSvg viewBox='0 0 192 192'>
          <path d={jlgPath} fill='rgba(255, 255, 255, .8)' />
        </LogoSvg>
      </Logo>

      <Statement>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magni cumque quas cupiditate porro doloribus maiores doloremque rem inventore accusantium molestias eligendi, adipisci nisi sed corporis quibusdam odio. Culpa, aliquid. Minima.
      </Statement>

      <LinkDock>
        <LinkBlock href="mailto:joshua@geschwendt.com">
          <Icon className="fas fa-envelope" />
          <Text>email</Text>
        </LinkBlock>
        <LinkBlock href="https://www.linkedin.com/in/jgeschwendt/" target='_blank'>
          <Icon className="fab fa-github" />
          <Text>github</Text>
        </LinkBlock>
        <LinkBlock href="https://www.github.com/jgeschwendt/" target='_blank'>
          <Icon className="fab fa-linkedin" />
          <Text>linkedin</Text>
        </LinkBlock>
        <LinkBlock href="https://rawgit.com/geschwendt/jlg-resume/master/resume.pdf" target='_blank'>
          <Icon className="fas fa-file" />
          <Text>resume</Text>
        </LinkBlock>
      </LinkDock>
    </Main>
  </App>
)
