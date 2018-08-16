import * as React from 'react'
import { render } from 'react-dom'
import App from './app'

export default (id: string) => {
  render(<App />, document.getElementById(id))
}
