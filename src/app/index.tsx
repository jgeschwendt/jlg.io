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
  border: .5rem solid #fff;
`

const SVG = styled.svg`
  height: 300px;
  width: 300px;
`

const jlgPath = 'M149,25 L149,60 L114,25 L149,25 Z M96,25 L96,131 C67,131 43,107 43,78 C43,48 66,25 96,25 Z M114,131 L114,78 L149,78 L149,131 C149,160 125,184 96,184 L96,149 C106,149 114,141 114,131 Z'

export default () => (
  <App>
    <HelloWorld>
      <SVG viewBox='0 0 192 192'>
        <path d={jlgPath} fill='#fff' />
      </SVG>
    </HelloWorld>
  </App>
)
