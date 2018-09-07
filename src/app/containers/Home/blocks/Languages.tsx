import * as React from 'react'
import styled from '../../../styled'

const Languages = styled.ul``
const LanguageItem = styled.li``

const Language = ({ filter = null, name = null, production = false }) => (
  <LanguageItem>{name}</LanguageItem>
)

export default () => (
  <Languages>
    <Language name='C#' production={true} />
    <Language name='C++' production={false} />
    <Language name='Elixir' production={true} />
    <Language name='PHP' production={true} />
    <Language name='Node.js' production={true} />
    <Language name='Python' production={false} />
  </Languages>
)