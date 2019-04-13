import * as React from 'react';
import styled from '../../../styled';

const LatestWork = styled.div``;

const Links = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const Link = styled.a`
  color: white;
  margin: .5rem;
  text-decoration: none;
`;

const Statement = styled.p`
  color: white;
  text-transform: uppercase;
  text-align: center;
`;

interface PropTypes {
  className: string | null;
}

const LatestWorkComponent = ({ className = null }: PropTypes): JSX.Element => (
  <LatestWork className={className}>
    <Statement>Checkout some of my latest work</Statement>
    <Links>
      <Link href="https://www.dig.solutions" target="_blank">https://www.dig.solutions</Link>
      <Link href="https://www.hurleyfoundation.org" target="_blank">https://www.hurleyfoundation.org</Link>
      <Link href="https://imcs.solutions" target="_blank">https://imcs.solutions</Link>
    </Links>
  </LatestWork>
);

export default LatestWorkComponent;
