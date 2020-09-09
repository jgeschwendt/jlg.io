import React from 'react';
import { Entypo } from '../../../components/Icons';
import styled from '../../../styled';

const Links = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem !important;
  padding: 0 1rem;
`;

const Link = styled.a`
  color: rgba(255, 255, 255, .9);
  display: block;
  font-size: 3rem;
  margin: .5rem;
  text-align: center;
  text-decoration: none;
`;

export const Social = (): JSX.Element => (
  <Links>
    <Link href='mailto:joshua@geschwendt.com'>
      <Entypo.MailWithCircle />
    </Link>

    <Link href='https://www.github.com/jgeschwendt/' target='_blank'>
      <Entypo.GitHubWithCircle />
    </Link>

    <Link href='https://www.linkedin.com/in/jgeschwendt/' target='_blank'>
      <Entypo.LinkedInWithCircle />
    </Link>
  </Links>
);
