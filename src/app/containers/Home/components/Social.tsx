import { HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';
import { Entypo } from '../../../components/Icons';
import styled from '../../../styled';

const MotionLinks = ({ children, ...props }: React.PropsWithChildren<HTMLMotionProps<'div'>>) => (
  <motion.div
    variants={{
      in: { transition: { staggerChildren: 0.1 } },
      out: { transition: { staggerChildren: 0.1, staggerDirection: -1 } },
    }}
    {...props}
  >{children}
  </motion.div>
);

const MotionLink = ({ children, ...props }: React.PropsWithChildren<HTMLMotionProps<'a'>>) => (
  <motion.a
    variants={{
      in: { y: 0 },
      out: { y: 15 },
    }}
    {...props}
  >{children}
  </motion.a>
);

const Links = styled(MotionLinks)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem !important;
  padding: 0 1rem;
`;

const Link = styled(MotionLink)`
  color: rgba(255, 255, 255, .9);
  display: flex;
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
