import * as React from 'react';
import styled, { css, keyframes, media } from '../../../styled';

interface LogoPropTypes {
  length: number;
}

const selectLength = ({ length }: LogoPropTypes): number => length;

const animatePath = ({ length }: LogoPropTypes): string => keyframes`
  0% {
    fill: rgba(255, 255, 255, 0);
    stroke-dashoffset: ${length};
  }

  25% {
    stroke-dashoffset: ${length};
  }

  50% {
    fill: rgba(255, 255, 255, 0);
  }

  100% {
    fill: rgba(255, 255, 255, 1);
    stroke-dashoffset: 0;
  }
`;

const Logo: React.StatelessComponent<LogoPropTypes> = styled.div`
  display: block;
  margin: 2rem auto;
  text-align: center;

  ${media.breakpoint.up('sm', css`
    margin: 4rem auto 2rem;
  `)}

  ${media.breakpoint.up('md', css`
    margin: 6rem auto 2rem;
  `)}

  ${media.breakpoint.up('lg', css`
    margin: 8rem auto 2rem;
  `)}

  ${media.breakpoint.up('xl', css`
    margin: 10rem auto 2rem;
  `)}

  svg {
    height: 12rem;
    width: 12rem;
  }

  path {
    stroke: white;
    stroke-width: 1;
    stroke-dasharray: ${selectLength};
    stroke-dashoffset: ${selectLength};
    animation: ${animatePath} 2s linear forwards;
  }
`;

const jlgPath = 'M140,20 L140,56 L104,20 L140,20 Z M88,20 L88,124 C59.281193,124 36,100.718807 36,72 C36,43.281193 59.281193,20 88,20 Z M88,176 L88,140 C96.836556,140 104,132.836556 104,124 L104,72 L140,72 L140,124 C140,152.718807 116.718807,176 88,176 Z';

interface PropTypes {
  className: string | null;
}

const Brand = (props: PropTypes): JSX.Element => {
  const ref: React.MutableRefObject<SVGPathElement> = React.useRef();

  return (
    <Logo length={ref.current ? ref.current.getTotalLength() : 0} {...props}>
      <svg viewBox='0 0 192 192'>
        <path d={jlgPath} ref={ref} />
      </svg>
    </Logo>
  );
};

export default Brand;
