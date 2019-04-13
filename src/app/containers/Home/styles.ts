import styled, { css, media } from '../../styled';

export const Main = styled.main`
  height: 100%;
  margin: auto;
  max-width: 50rem;

  .statement {
    opacity: 0;
    transform: translateY(1rem);
    transition: transform 700ms ease-in, opacity 1000ms ease-in;
  }

  .statement-enter-done {
    opacity: 1;
    transform: translateY(0rem);
    transition: transform 700ms ease-in, opacity 1000ms ease-in;
  }

  .latest-work {
    opacity: 0;
    transition: opacity 1s ease-in;
  }

  .latest-work-enter-done {
    opacity: 1;
    transition: opacity 1s ease-in;
  }

  .social {
    opacity: 0;
    transition: opacity 1s ease-in;
  }

  .social-enter-done {
    opacity: 1;
    transition: opacity 1s ease-in;
  }
`;

export const StatementContainer = styled.div`
  margin: 2rem auto;
  max-width: 50rem;
  padding: 0 1rem;
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
  margin: 0;
  text-align: center;

  ${media.breakpoint.up('md', css`
    font-size: 1.5rem;
  `)}
`;
