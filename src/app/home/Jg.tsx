'use client';

import { type Transition, type Variants, m } from 'motion/react';
import type { JSX } from 'react';

const JG_PATH =
  'M13.25 20C13.25 14.6988 17.4808 10.3858 22.75 10.2531V29.7469C17.4808 29.6142 13.25 25.3012 13.25 20ZM25.25 10.25H32.75V30C32.75 35.3012 28.5192 39.6142 23.25 39.7469V32.2363C24.375 32.1119 25.25 31.1581 25.25 30V10.25Z';

export function Jg({
  transition,
  variants,
}: Readonly<{
  transition: Transition;
  variants: Variants;
}>): JSX.Element {
  return (
    <m.svg
      className="w-48 stroke-white"
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeWidth={0.5}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <m.path d={JG_PATH} transition={transition} variants={variants} />
    </m.svg>
  );
}
