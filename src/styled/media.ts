import { FlattenSimpleInterpolation, css } from 'styled-components';
import theme from './theme';

type MediaBreakpointEnum = 'sm' | 'md' | 'lg' | 'xl';

class BreakpointFactory {
  private theme: {
    breakpoints: Record<string, number>;
  };

  public constructor ($theme = {}) {
    this.theme = { ...this.theme, ...$theme };
  }

  public up (media: MediaBreakpointEnum, rules: FlattenSimpleInterpolation): FlattenSimpleInterpolation {
    return css`
      @media (min-width: ${this.theme.breakpoints[media]}px) {
        ${rules}
      }
    `;
  }

  public down (media: MediaBreakpointEnum, rules: FlattenSimpleInterpolation): FlattenSimpleInterpolation {
    return css`
      @media (max-width: ${this.theme.breakpoints[media] - .02}px) {
        ${rules}
      }
    `;
  }
}

export default {
  breakpoint: new BreakpointFactory(theme),
  print: (rules: FlattenSimpleInterpolation): FlattenSimpleInterpolation => css`
    @media print {
      ${rules}
    }
  `,
};
