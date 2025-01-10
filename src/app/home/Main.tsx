'use client';

import { m } from 'motion/react';
import Link from 'next/link';
import type { JSX } from 'react';
import { At, File, GitHub, LinkedIn } from '@/components/icons';
import { Jg } from './Jg';
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
          [SHOW]: { opacity: 1, transition: { staggerChildren: 2 } },
        }}
      >
        <Jg
          transition={{
            default: {
              duration: 1.75,
              ease: 'easeIn',
            },
            fill: {
              delay: 1,
              duration: 0.75,
              ease: 'easeIn',
            },
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

        <m.div
          className="flex flex-col items-center"
          variants={{
            [HIDE]: {},
            [SHOW]: {
              transition: { staggerChildren: 0.25 },
            },
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
                  y: { bounce: 0.5, duration: 1.25, type: 'spring' },
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
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {links.map(([Icon, label, href]) => (
              <m.li
                key={label}
                variants={{
                  [HIDE]: {
                    opacity: 0,
                    y: 24,
                  },
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
                  className="mx-1 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.125)] text-xl text-white transition duration-300 hover:border-[rgba(255,255,255,.5)] hover:bg-[rgba(255,255,255,.25)]"
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
