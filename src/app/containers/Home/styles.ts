import styled from '../../styled';

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
    transition: opacity 3s ease-in;
  }

  .latest-work-enter-done {
    opacity: 1;
    transition: opacity 3s ease-in;
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
