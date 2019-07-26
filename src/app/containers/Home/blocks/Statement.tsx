import * as React from 'react';
import styled, { css, media } from '../../../styled';

const statement = `
  I'm a seasoned software engineer with seven years of professional experience located in Grand Rapids, Michigan.
  I specialize in Cloud Elixir and Node.js services, along with React applications with a wide umbrella of web and data-driven skill sets.
`;

const resume = 'https://rawgit.com/geschwendt/jlg-resume/master/resume.pdf';

export const StatementContainer = styled.div`
  margin: 2rem auto;
  max-width: 50rem;
  padding: 0 1rem;
  text-align: center;
  width: 100%;

  ${media.breakpoint.up('md', css`
    font-size: 1.5rem;
    margin: 4rem auto;
  `)}
`;

export const Statement = styled.p`
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

const Component = (props): JSX.Element => (
  <StatementContainer {...props}>
    <Statement>{statement}</Statement>
    <Link href={resume} target='_blank'>[&ensp;View My Resume&ensp;]</Link>
  </StatementContainer>
);

export default Component;
