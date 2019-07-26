import * as React from 'react';
import { Envelope, GitHub, LinkedIn } from '../../../components/Icons';
import styled, { css, media } from '../../../styled';

const Links = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem auto;
  padding: 0 1rem;

  ${media.breakpoint.up('sm', css`
    font-size: 2rem;
  `)}
`;

const Row = styled.div`
  text-align: center;
  width: 100%;

  ${media.breakpoint.up('sm', css`
    width: auto;
  `)}
`;

const Col = styled.div`
  display: inline-block;
  width: 7rem;

  ${media.breakpoint.up('sm', css`
    width: auto;
  `)}
`;

const Link = styled.a`
  color: rgba(255, 255, 255, .8);
  display: block;
  margin: 1rem;
  text-align: center;
  text-decoration: none;
`;

const SocialComponent = ({ className = null }): JSX.Element => (
  <Links className={className}>
    <Row>
      <Col>
        <Link href='mailto:joshua@geschwendt.com'>
          <Envelope />
        </Link>
      </Col>
      <Col>
        <Link href='https://www.github.com/jgeschwendt/' target='_blank'>
          <GitHub />
        </Link>
      </Col>
      <Col>
        <Link href='https://www.linkedin.com/in/jgeschwendt/' target='_blank'>
          <LinkedIn />
        </Link>
      </Col>
    </Row>
  </Links>
);

export default SocialComponent;
