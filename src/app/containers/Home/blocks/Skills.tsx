import * as React from 'react';
import styled, { css, media } from '../../../styled';

const Skills = styled.ul`
  margin: auto;
  width: 100%;

  ${media.breakpoint.up('md', css`
    max-width: 50rem;
  `)}
`;
const SkillItem = styled.li``;

/* eslint-disable-next-line */
const Skill = ({ filter = null, name = null, production = false }) => (
  <SkillItem>{name}</SkillItem>
);

const SkillsComponent = (): JSX.Element => (
  <Skills>
    <Skill name='Apollo' production={true} />
    <Skill name='CraftCMS' production={true} />
    <Skill name='GraphQL' production={true} />
    <Skill name='Grunt/Gulp' production={true} />
    <Skill name='Prisma' production={false} />
    <Skill name='Sitefinity' production={true} />
    <Skill name='Rollup/Webpack' production={true} />
    <Skill name='Wordpress' production={true} />
  </Skills>
);

export default SkillsComponent;
