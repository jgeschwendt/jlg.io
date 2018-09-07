
import * as React from 'react'
import styled, { css, media } from '../../../styled'

const LinkDock = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem auto;
  padding: 0 1rem;

  ${media.breakpoint.up('sm', css`
    font-size: 2rem;
  `)}
`

const Row = styled.div`
  text-align: center;
  width: 100%;

  ${media.breakpoint.up('sm', css`
    width: auto;
  `)}
`

const Col = styled.div`
  display: inline-block;
  width: 7rem;

  ${media.breakpoint.up('sm', css`
    width: auto;
  `)}
`

const Link = styled.a`
  color: rgba(255, 255, 255, .8);
  display: block;
  margin: 1rem;
  text-align: center;
  text-decoration: none;
`

const Icon: any = styled.i`
  display: block;
  font-size: 1.5rem;
  margin-bottom: .75rem;

  ${media.breakpoint.up('sm', css`
    font-size: 2rem;
  `)}
`

const Text = styled.span`
  display: block;
  font-size: .7rem;
  letter-spacing: 2px;
  text-transform: uppercase;

  ${media.breakpoint.up('sm', css`
    font-size: .8rem;
  `)}
`

export default ({ className = null }) => (
  <LinkDock className={className}>
    <Row>
      <Col>
        <Link href='mailto:joshua@geschwendt.com'>
          <Icon className='fas fa-envelope' />
          <Text>email</Text>
        </Link>
      </Col>
      <Col>
        <Link href='https://www.github.com/jgeschwendt/' target='_blank'>
          <Icon className='fab fa-github' />
          <Text>github</Text>
        </Link>
      </Col>
    </Row>
    <Row>
      <Col>
        <Link href='https://www.linkedin.com/in/jgeschwendt/' target='_blank'>
          <Icon className='fab fa-linkedin' />
          <Text>linkedin</Text>
        </Link>
      </Col>
      <Col>
        <Link href='https://rawgit.com/geschwendt/jlg-resume/master/resume.pdf' target='_blank'>
          <Icon className='fas fa-file' />
          <Text>resume</Text>
        </Link>
      </Col>
    </Row>
  </LinkDock>
)
