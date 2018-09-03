
import * as React from 'react'
import styled from '../../../styled'

const LinkDock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  margin: 2rem auto;
`

const LinkBlock = styled.a`
  color: rgba(255, 255, 255, .8);
  margin: 1rem;
  text-align: center;
  text-decoration: none;
`

const Icon: any = styled.i`
  display: block;
  font-size: 2rem;
  margin-bottom: .75rem;
`

const Text = styled.span`
  display: block;
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`

export default ({ className = null }) => (
  <LinkDock className={className}>
    <LinkBlock href='mailto:joshua@geschwendt.com'>
      <Icon className='fas fa-envelope' />
      <Text>email</Text>
    </LinkBlock>
    <LinkBlock href='https://www.github.com/jgeschwendt/' target='_blank'>
      <Icon className='fab fa-github' />
      <Text>github</Text>
    </LinkBlock>
    <LinkBlock href='https://www.linkedin.com/in/jgeschwendt/' target='_blank'>
      <Icon className='fab fa-linkedin' />
      <Text>linkedin</Text>
    </LinkBlock>
    <LinkBlock href='https://rawgit.com/geschwendt/jlg-resume/master/resume.pdf' target='_blank'>
      <Icon className='fas fa-file' />
      <Text>resume</Text>
    </LinkBlock>
  </LinkDock>
)
