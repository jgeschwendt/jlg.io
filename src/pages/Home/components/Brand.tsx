import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

const Logo = styled.div`
  display: block;
  height: 12rem;
  margin: 0 auto;
  width: 12rem;

  svg {
    stroke: #fff;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    width: 100%;
  }
`;

const jlgPath = 'M140,20 L140,56 L104,20 L140,20 Z M88,20 L88,124 C59.281193,124 36,100.718807 36,72 C36,43.281193 59.281193,20 88,20 Z M88,176 L88,140 C96.836556,140 104,132.836556 104,124 L104,72 L140,72 L140,124 C140,152.718807 116.718807,176 88,176 Z';

export const Brand = (): JSX.Element => (
  <Logo>
    <motion.svg
      viewBox="0 0 192 192"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        animate="in"
        d={jlgPath}
        initial="out"
        transition={{
          default: {
            delay: 0.5,
            duration: 2,
            ease: "easeIn",
          },
          fill: {
            delay: 1,
            duration: 2,
            ease: "easeIn",
          },
        }}
        variants={{
          in: {
            fill: "rgba(255, 255, 255, 1)",
            opacity: 1,
            pathLength: 1,
          },
          out: {
            fill: "rgba(255, 255, 255, 0)",
            opacity: 0,
            pathLength: 0,
          },
        }}
      />
    </motion.svg>
  </Logo>
);
