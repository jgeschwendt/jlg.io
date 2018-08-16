import * as React from 'react'
import styled from 'styled-components'

const App = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

const HelloWorld = styled.div`
  padding: 2rem;
  border: 1px solid #18453b;
`

export default () => (
  <App>
    <HelloWorld>hello, world</HelloWorld>
  </App>
)
