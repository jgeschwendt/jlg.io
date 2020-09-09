import React from 'react';
import styled, { css } from 'styled-components';
import { media } from '../../../styled';

const statement = `
  I'm a seasoned software engineer with eight years of professional experience located in Grand Rapids, Michigan.
  I specialize in Node.js services and React applications.
`.trim();

const resume = 'https://jgeschwendt.github.io/jlg-resume/';

export const StatementContainer = styled.div`
  padding: 0 1rem;
  text-align: center;
`;

export const StatementComponent = styled.p`
  color: rgba(255, 255, 255, .8);
  font-size: 1.25rem;
  font-weight: 100;
  letter-spacing: 1px;
  line-height: 1.5;
  margin: 0 0 1.5rem;

  ${media.breakpoint.up('md', css`
    font-size: 1.5rem;
  `)}
`;

export const Link = styled.a`
  color: rgba(255, 255, 255, .8);
  font-size: 1rem;
  text-decoration: none;
  text-transform: uppercase;
`;

export const Statement = (): JSX.Element => (
  <StatementContainer>
    <StatementComponent>{statement}</StatementComponent>
    <Link href={resume} target='_blank'>[&ensp;View My Resume&ensp;]</Link>
  </StatementContainer>
);

