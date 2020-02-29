import * as React from 'react';
import { Entypo } from '../../../components/Icons';
import styled, { css, media } from '../../../styled';

const Links = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem !important;
  padding: 0 1rem;

  ${media.breakpoint.up('sm', css`
    font-size: 2rem;
  ` as any)}
`;

const Row = styled.div`
  text-align: center;
  width: 100%;

  ${media.breakpoint.up('sm', css`
    width: auto;
  ` as any)}
`;

const Col = styled.div`
  display: inline-block;
  width: 7rem;

  ${media.breakpoint.up('sm', css`
    width: auto;
  ` as any)}
`;

const Link = styled.a`
  color: rgba(255, 255, 255, .8);
  display: block;
  margin: .5rem;
  text-align: center;
  text-decoration: none;
  width: 3rem;
`;

const SocialComponent = ({ className = null }): JSX.Element => (
  <Links className={className}>
    <Row>
      <Col>
        <Link href='mailto:joshua@geschwendt.com'>
          <Entypo.MailWithCircle />
        </Link>
      </Col>
      <Col>
        <Link href='https://www.github.com/jgeschwendt/' target='_blank'>
          <Entypo.GitHubWithCircle />
        </Link>
      </Col>
      <Col>
        <Link href='https://www.linkedin.com/in/jgeschwendt/' target='_blank'>
          <Entypo.LinkedInWithCircle />
        </Link>
      </Col>
    </Row>
  </Links>
);

export default SocialComponent;
