import React from 'react';
import styled from 'styled-components';

const Icon = styled.img`
  width: 100%;
`;

const IconComponent = (icon: string, name: string): () => JSX.Element => (): JSX.Element => (
  <Icon src={`http://entypo.com/images/${icon}.svg`} alt={name} />
);

export const Entypo = {
  GitHubWithCircle:    IconComponent('github-with-circle',    'GitHub with circle'),
  LinkedInWithCircle:  IconComponent('linkedin-with-circle',  'LinkedIn with circle'),
  MailWithCircle:      IconComponent('mail-with-circle',      'Mail with circle'),
};
