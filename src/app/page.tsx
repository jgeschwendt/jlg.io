'use client';

import Envelope from '@fortawesome/fontawesome-free/svgs/solid/envelope.svg?svgr';
import File from '@fortawesome/fontawesome-free/svgs/solid/file.svg?svgr';
import GitHub from '@fortawesome/fontawesome-free/svgs/brands/github.svg?svgr';
import LinkedInIn from '@fortawesome/fontawesome-free/svgs/brands/linkedin-in.svg?svgr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import JG from './jg';
import { Statement } from './statement';

const [HIDE, SHOW] = ['HIDE', 'SHOW'];

// prettier-ignore
const links = [
  [File,       'Resume',   '/resume'],
  [GitHub,     'GitHub',   'https://github.com/jgeschwendt'           ],
  [LinkedInIn, 'LinkedIn', 'https://www.linkedin.com/in/jgeschwendt'  ],
  [Envelope,   'Email',    'mailto:joshua@geschwendt.com'             ],
] as const;

export default function Content() {
  return (
    <main className="absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={SHOW}
        className="flex flex-col items-center"
        initial={HIDE}
        variants={{
          [HIDE]: { opacity: 0 },
          [SHOW]: {
            opacity: 1,
            transition: {
              staggerChildren: 2,
            },
          },
        }}
      >
        <JG
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

        <motion.div
          className="flex flex-col items-center"
          variants={{
            [HIDE]: {},
            [SHOW]: {
              transition: {
                staggerChildren: 0.25,
              },
            },
          }}
        >
          <h1 className="sr-only">Joshua L Geschwendt</h1>
          <motion.p
            className="mx-4 mb-8 max-w-[60ch] text-center text-white"
            variants={{
              [HIDE]: { opacity: 0, y: 25 },
              [SHOW]: {
                opacity: 1,
                transition: {
                  y: { bounce: 0.5, duration: 1, type: 'spring' },
                },
                y: 0,
              },
            }}
          >
            <Statement />
          </motion.p>

          <motion.ul
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
            {links.map(([Icon, label, href], key) => (
              <motion.li
                key={key}
                variants={{
                  [HIDE]: {
                    opacity: 0,
                    y: 25,
                  },
                  [SHOW]: {
                    opacity: 1,
                    transition: {
                      opacity: { duration: 0.5 },
                      y: { bounce: 0.5, duration: 1, type: 'spring' },
                    },
                    y: 0,
                  },
                }}
              >
                <Link
                  aria-label={label}
                  className="mx-1 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.125)] transition duration-300 hover:border-[rgba(255,255,255,.5)] hover:bg-[rgba(255,255,255,.25)]"
                  href={href}
                >
                  <Icon className="max-w-5 max-h-5 w-full" fill="white" />
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>
    </main>
  );
}
