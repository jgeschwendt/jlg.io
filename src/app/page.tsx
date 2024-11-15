'use client';

import Link from 'next/link';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import { Envelope, File, GitHub, LinkedInIn } from '../components/icons';
import { JG } from './jg';
import { Statement } from './statement';

const [HIDE, SHOW] = ['0', '1'];

// prettier-ignore
const links = [
  [File,       'Resume',   '/resume'],
  [GitHub,     'GitHub',   'https://github.com/jgeschwendt'           ],
  [LinkedInIn, 'LinkedIn', 'https://www.linkedin.com/in/jgeschwendt'  ],
  [Envelope,   'Email',    'mailto:joshua@geschwendt.com'             ],
] as const;

export default function Page() {
  return (
    <LazyMotion features={domAnimation} strict={true}>
      <main className="absolute inset-0 flex items-center justify-center px-4">
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
            motion={motion}
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
                    className="mx-1 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-[rgba(255,255,255,.25)] bg-[rgba(255,255,255,.125)] transition duration-300 hover:border-[rgba(255,255,255,.5)] hover:bg-[rgba(255,255,255,.25)]"
                    href={href}
                  >
                    <Icon className="max-h-5 w-full max-w-5" fill="white" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </main>
    </LazyMotion>
  );
}
