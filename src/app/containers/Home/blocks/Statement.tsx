import * as React from 'react';
import { Container } from '../../../components';
import styled, { css, media } from '../../../styled';

const statement = `
  I'm a seasoned software engineer with eight years of professional experience located in Grand Rapids, Michigan.
  I specialize in Node.js services and React applications.
`;

const resume = 'https://rawgit.com/geschwendt/jlg-resume/master/resume.pdf';

export const StatementContainer = styled(Container)`
  text-align: center;
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
