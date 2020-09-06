import React from 'react';
import styled from 'styled-components';

const StyledIcon = styled.img`
  width: 100%;
`;

// eslint-disable-next-line react/display-name
const Icon = (icon: string, name: string) => (): JSX.Element => (
  <StyledIcon src={`http://entypo.com/images/${icon}.svg`} alt={name} />
);

export const Entypo = {
  GitHubWithCircle:    Icon('github-with-circle',    'GitHub with circle'),
  LinkedInWithCircle:  Icon('linkedin-with-circle',  'LinkedIn with circle'),
  MailWithCircle:      Icon('mail-with-circle',      'Mail with circle'),
};
