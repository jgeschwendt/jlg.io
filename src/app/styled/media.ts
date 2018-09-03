import { css, InterpolationValue } from 'styled-components'
import theme from './theme'

type MediaBreakpointEnum = 'sm' | 'md' | 'lg' | 'xl'

class BreakpointFactory {
  private theme

  constructor ($theme = {}) {
    this.theme = { ...this.theme, ...$theme }
  }

  up (media: MediaBreakpointEnum, rules: InterpolationValue[]) {
    return css`
      @media (min-width: ${this.theme.breakpoints[media]}px) {
        ${rules}
      }
    `
  }

  down (media: MediaBreakpointEnum, rules: string) {
    return css`
      @media (max-width: ${this.theme.breakpoints[media] - .02}px) {
        ${rules}
      }
    `
  }
}

export default {
  breakpoint: new BreakpointFactory(theme),
  print: rules => css`
    @media print {
      ${rules}
    }
  `
}
