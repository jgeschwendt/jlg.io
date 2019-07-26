import * as React from 'react';
import styled from '../../styled';

type Position = 'bottom' | 'left' | 'right' | 'top';

interface PropTypes {
  position?: Position;
  size?: string;
}

const position = ({ position = 'top' }: PropTypes): string => `margin-${position}`;
const size = ({ size = '4rem' }: PropTypes): string => size;

const Container: React.FunctionComponent<PropTypes> = styled.div`
  & > * + * { ${position}: ${size}; }
`;

export const LobotomizedOwl = (props: PropTypes): JSX.Element => (
  <Container {...props} />
);
