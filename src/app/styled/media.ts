import { css, InterpolationValue } from 'styled-components';
import theme from './theme';

type MediaBreakpointEnum = 'sm' | 'md' | 'lg' | 'xl'

class BreakpointFactory {
  private theme

  public constructor ($theme = {}) {
    this.theme = { ...this.theme, ...$theme };
  }

  public up (media: MediaBreakpointEnum, rules: InterpolationValue[]): any {
    return css`
      @media (min-width: ${this.theme.breakpoints[media]}px) {
        ${rules}
      }
    `;
  }

  public down (media: MediaBreakpointEnum, rules: string): any {
    return css`
      @media (max-width: ${this.theme.breakpoints[media] - .02}px) {
        ${rules}
      }
    `;
  }
}

export default {
  breakpoint: new BreakpointFactory(theme),
  print: (rules: string): any => css`
    @media print {
      ${rules}
    }
  `,
};
