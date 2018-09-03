import styled, { css, media } from '../../styled'

export const App = styled.div`
  bottom: 0;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`

export const Main = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;

  .statement {
    opacity: 0;
    transition: opacity 1s ease-in;
  }

  .statement-enter-done {
    opacity: 1;
    transition: opacity 1s ease-in;
  }

  .social {
    opacity: 0;
    transition: opacity 1s ease-in;
  }

  .social-enter-done {
    opacity: 1;
    transition: opacity 1s ease-in;
  }
`

export const Statement = styled.p`
  color: rgba(255, 255, 255, .8);
  font-size: 1.25rem;
  font-weight: 100;
  letter-spacing: 1px;
  line-height: 1.5;
  margin: 2rem auto;
  padding: 1rem;
  text-align: center;
  width: 100%;


  ${media.breakpoint.up('md', css`
    font-size: 1.5rem;
    max-width: 50rem;
  `)}
`
