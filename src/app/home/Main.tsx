'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import type { JSX } from 'react';
import { At, File, GitHub, LinkedIn } from '@/components/icons';
import { Statement } from './Statement';

const [HIDE, SHOW] = ['0', '1'];

const links = [
  [At, 'Email', 'mailto:joshua@geschwendt.com'],
  [File, 'Resume', '/resume'],
  [GitHub, 'GitHub', 'https://github.com/jgeschwendt'],
  [LinkedIn, 'LinkedIn', 'https://www.linkedin.com/in/jgeschwendt'],
] as const;

export function Main(): JSX.Element {
  return (
    <main className="absolute inset-0 flex items-center justify-center px-4">
      <m.div
        animate={SHOW}
        className="flex flex-col items-center"
        initial={HIDE}
        variants={{
          [HIDE]: { opacity: 0 },
          [SHOW]: {
            opacity: 1,
            transition: { staggerChildren: 2 },
          },
        }}
      >
        <m.svg
          className="w-48 stroke-white"
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth={0.5}
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <m.path
            d="M13.25 20C13.25 14.6988 17.4808 10.3858 22.75 10.2531V29.7469C17.4808 29.6142 13.25 25.3012 13.25 20ZM25.25 10.25H32.75V30C32.75 35.3012 28.5192 39.6142 23.25 39.7469V32.2363C24.375 32.1119 25.25 31.1581 25.25 30V10.25Z"
            transition={{
              default: { delay: 0.25, duration: 1.75, ease: 'easeIn' },
              fill: { delay: 1.25, duration: 0.75, ease: 'easeIn' },
            }}
            variants={{
              [HIDE]: {
                fill: 'rgba(255, 255, 255, 0)',
                opacity: 0,
                pathLength: 0,
              },
              [SHOW]: {
                fill: 'rgba(255, 255, 255, 1)',
                opacity: 1,
                pathLength: 1,
              },
            }}
          />
        </m.svg>

        <m.div
          className="flex flex-col items-center"
          variants={{
            [HIDE]: {},
            [SHOW]: { transition: { staggerChildren: 0.25 } },
          }}
        >
          <h1 className="sr-only">{'Joshua L Geschwendt'}</h1>
          <m.p
            className="mb-8 max-w-xl text-center text-white"
            variants={{
              [HIDE]: { opacity: 0, y: 24 },
              [SHOW]: {
                opacity: 1,
                transition: {
                  opacity: { duration: 0.5 },
                  y: { bounce: 0.5, duration: 1.5, type: 'spring' },
                },
                y: 0,
              },
            }}
          >
            <Statement />
          </m.p>

          <m.ul
            className="flex text-white"
            variants={{
              [HIDE]: { opacity: 0 },
              [SHOW]: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {links.map(([Icon, label, href]) => (
              <m.li
                key={label}
                variants={{
                  [HIDE]: { opacity: 0, y: 24 },
                  [SHOW]: {
                    opacity: 1,
                    transition: {
                      opacity: { duration: 0.5 },
                      y: { bounce: 0.5, duration: 1.25, type: 'spring' },
                    },
                    y: 0,
                  },
                }}
              >
                <Link
                  aria-label={label}
                  className="mx-1 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[oklch(1_0_0/.05)] bg-[oklch(1_0_0/.05)] text-xl text-white transition duration-300 hover:border-[oklch(1_0_0/.1)] hover:bg-[oklch(1_0_0/.1)]"
                  href={href}
                >
                  <Icon />
                </Link>
              </m.li>
            ))}
          </m.ul>
        </m.div>
      </m.div>
    </main>
  );
}
