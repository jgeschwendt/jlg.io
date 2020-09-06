import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';
import { Brand } from './blocks/Brand';
import { Social } from './blocks/Social';
import { Statement } from './blocks/Statement';
import styled, { css, media } from '../../styled';

const MotionList = ({ children, ...props }: React.PropsWithChildren<HTMLMotionProps<'div'>>) => (
  <motion.div
    variants={{
      in: { transition: { delayChildren: 2, staggerChildren: 0.25 } },
      out: { transition: { staggerChildren: 0.25, staggerDirection: -1 } },
    }}
    {...props}
  >{children}
  </motion.div>
);

const MotionItem = ({ children, ...props }: React.PropsWithChildren<HTMLMotionProps<'div'>>) => (
  <motion.div
    variants={{
      in: {
        opacity: 1,
        transition: { y: { duration: 0.5, stiffness: 1000 } },
        y: 0,
      },
      out: {
        opacity: 0,
        transition: { y: { duration: 0.5, stiffness: 1000 } },
        y: 25,
      },
    }}
    {...props}
  >{children}
  </motion.div>
);

const Main = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  max-width: 900px;
  min-height: 100%;
  min-height: 100vh;
  padding: 2rem 0;

  & > * + * { margin-top: 2rem; }

  ${media.breakpoint.up('md', css`
    & > * + * { margin-top: 4rem; }
  `)}
`;

const List = styled(MotionList)`
  & > * + * { margin-top: 2rem; }

  ${media.breakpoint.up('md', css`
    & > * + * { margin-top: 4rem; }
  `)}
`;

const Item = styled(MotionItem)``;

const Home = (): JSX.Element => (
  <Main>
    <Brand />
    <List animate='in' initial='out'>
      <Item>
        <Statement />
      </Item>
      <Item>
        <Social />
      </Item>
    </List>
  </Main>
);

export default Home;
