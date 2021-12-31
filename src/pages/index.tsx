import { css, Global } from '@emotion/react';
import { motion } from 'framer-motion';
import { Icon } from '../components';

const STATEMENT = (
  <>
    I&apos;m a seasoned web engineer with {new Date().getFullYear() - 2012} years
    of professional experience located in Grand Rapids, Michigan. I specialize
    in Node.js services and React applications.
  </>
);

const BUTTONS = [
  [Icon.File, 'https://jgeschwendt.github.io/jlg-resume/'],
  [Icon.Envelope, 'mailto:joshua@geschwendt.com'],
  [Icon.GitHub, 'https://github.com/jgeschwendt'],
  [Icon.LinkedInIn, 'https://www.linkedin.com/in/jgeschwendt'],
] as const;

const [HIDE, SHOW] = ['hide', 'show'];

const bp = {
  up: {
    sm: '@media (min-width: 576px)',
    md: '@media (min-width: 768px)',
    lg: '@media (min-width: 992px)',
    xl: '@media (min-width: 1200px)',
  },
};

const Main = () => (
  <>
    <Global
      styles={css({
        body: {
          '--bs-body-bg': '#1a1a1a',
          '--bs-body-font-family': 'Lato, sans-serif',
        },
      })}
    />
    <main
      css={css({
        alignItems: 'center',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100vh',
      })}
    >
      <div
        css={css({
          display: 'block',
          margin: '0 auto',
          maxWidth: '100%',
          width: '16rem',
        })}
      >
        <motion.svg
          css={css({
            stroke: '#fff',
            strokeWidth: 0.5,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
            width: '100%',
          })}
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={SHOW}
            d="M13.5 20C13.5 14.921 17.4857 10.7729 22.5 10.5129V29.4871C17.4857 29.2271 13.5 25.079 13.5 20ZM26.5 10.5H32.5V30C32.5 35.079 28.5143 39.2271 23.5 39.4871V33.4646C25.1961 33.2219 26.5 31.7632 26.5 30V10.5Z"
            initial={HIDE}
            transition={{
              default: { delay: 0.5, duration: 2, ease: 'easeIn' },
              fill: { delay: 1, duration: 2, ease: 'easeIn' },
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
        </motion.svg>
      </div>

      <motion.div
        animate={SHOW}
        css={css({
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        })}
        initial={HIDE}
        variants={{
          [SHOW]: {
            transition: {
              delayChildren: 2,
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.p
          css={css({
            marginInline: '1rem',
            marginBlockEnd: '2rem',
            maxWidth: '50ch',
            textAlign: 'center',
            [bp.up.md]: {
              fontSize: '1.25rem',
            },
          })}
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
          {STATEMENT}
        </motion.p>

        <motion.div
          css={css({ display: 'flex' })}
          variants={{
            [SHOW]: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {BUTTONS.map(([Icon_, href]) => (
            <motion.a
              css={css({
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, .5)',
                borderRadius: '1.75rem',
                display: 'flex',
                height: '2.75rem',
                justifyContent: 'center',
                marginInline: '.5rem',
                width: '2.75rem',
              })}
              href={href}
              key={href}
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
              <Icon_
                css={css({
                  height: '100%',
                  maxHeight: '1.25rem',
                  maxWidth: '1.25rem',
                  width: '100%',
                })}
                fill="white"
              />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </main>
  </>
);

export default Main;