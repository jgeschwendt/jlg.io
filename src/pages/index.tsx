import { Global, css } from '@emotion/react';
import { LazyMotion, domAnimation, m as motion } from 'framer-motion';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Font, Icon } from '../components';

const AnimationTrigger = 'animation-trigger';

const Statement = ({ y_o_e }: { y_o_e: number }) => (
  <>
    I&apos;m a seasoned web engineer with {y_o_e} years of professional
    experience located in West Michigan. I specialize in Node.js services and
    React applications.
  </>
);

const JG =
  'M13.25 20C13.25 14.6988 17.4808 10.3858 22.75 10.2531V29.7469C17.4808 29.6142 13.25 25.3012 13.25 20ZM25.25 10.25H32.75V30C32.75 35.3012 28.5192 39.6142 23.25 39.7469V32.2363C24.375 32.1119 25.25 31.1581 25.25 30V10.25Z';

const BUTTONS = [
  [Icon.File, '/resume'],
  [Icon.GitHub, 'https://github.com/jgeschwendt'],
  [Icon.LinkedInIn, 'https://www.linkedin.com/in/jgeschwendt'],
  [Icon.Envelope, 'mailto:joshua@geschwendt.com'],
] as const;

const [HIDE, SHOW] = ['hide', 'show'];

const mq = (bp: number) => `@media (min-width: ${bp}px)`;
const bp = {
  up: {
    sm: mq(576),
    md: mq(768),
    lg: mq(992),
    xl: mq(1200),
  },
};

export const getServerSideProps = async () => ({
  props: {
    y_o_e: new Date().getFullYear() - 2012,
  },
});

export default function Main(props: any) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    window.addEventListener(AnimationTrigger, () => {
      setShow(true);
    });
  }, []);

  return (
    <LazyMotion features={domAnimation} strict={true}>
      <Head>
        <title>Joshua L Geschwendt&mdash;Web Engineer</title>
      </Head>
      <Font fontDisplay="block" lato={['light']} />
      <Global
        styles={css({
          'html': {
            height: '100%',
          },
          'body': {
            alignItems: 'center',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            justifyContent: 'center',
            minHeight: ['fill-available', '100%'],
          },
          'image, svg': {
            verticalAlign: 'middle',
          },
          '*:focus-visible': {
            outlineColor: 'red',
          },
        })}
      />
      <Script
        dangerouslySetInnerHTML={{
          __html: `(function(){window.dispatchEvent(new Event("${AnimationTrigger}"));})();`,
        }}
        id={AnimationTrigger}
        strategy="lazyOnload"
      />
      <main
        css={{
          alignItems: 'center',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          css={{
            display: 'block',
            margin: '0 auto',
          }}
        >
          <motion.svg
            css={{
              stroke: '#fff',
              strokeWidth: 0.5,
              strokeLinejoin: 'miter',
              strokeLinecap: 'square',
              width: 48 * 4,
            }}
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              animate={show ? SHOW : HIDE}
              d={JG}
              initial={HIDE}
              transition={{
                default: { duration: 1.75, ease: 'easeIn' },
                fill: { delay: 1, duration: 0.75, ease: 'easeIn' },
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
          animate={show ? SHOW : HIDE}
          css={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
          initial={HIDE}
          variants={{
            [SHOW]: {
              transition: { delayChildren: 2, staggerChildren: 0.1 },
            },
          }}
        >
          <motion.p
            css={{
              lineHeight: 1.5,
              marginInline: '1rem',
              marginBlockEnd: '2rem',
              marginBlockStart: 0,
              maxWidth: '60ch',
              textAlign: 'center',
              [bp.up.md]: {
                fontSize: '1.25rem',
              },
            }}
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
            <Statement {...props} />
          </motion.p>

          <motion.div
            css={{ display: 'flex' }}
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
                css={{
                  'alignItems': 'center',
                  'backgroundColor': 'rgba(255, 255, 255, .125)',
                  'borderColor': 'rgba(255, 255, 255, .25)',
                  'borderRadius': '.5rem',
                  'borderStyle': 'solid',
                  'borderWidth': 2,
                  'display': 'flex',
                  'height': '2.75rem',
                  'justifyContent': 'center',
                  'marginInline': '.25rem',
                  'width': '2.75rem',
                  'transition':
                    'background-color 600ms ease-out, border-color 600ms ease-out',
                  ':hover': {
                    backgroundColor: 'rgba(255, 255, 255, .25)',
                    borderColor: 'rgba(255, 255, 255, .5)',
                    transition:
                      'background-color 300ms ease-out, border-color 300ms ease-out',
                  },
                }}
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
                  css={{
                    height: '100%',
                    maxHeight: '1.25rem',
                    maxWidth: '1.25rem',
                    width: '100%',
                  }}
                  fill="white"
                />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </LazyMotion>
  );
}
