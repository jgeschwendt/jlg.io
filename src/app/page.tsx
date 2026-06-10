import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import type { JSX } from 'react';
import type { Metadata } from 'next';
import { Main, statement } from './home';

export const generateMetadata = async (): Promise<Metadata> => {
  // Defer to request time: statement() derives the years figure from the clock,
  // which cache components forbid during build-time prerendering.
  await connection();

  return {
    description: statement(),
    title: 'Joshua L Geschwendt—Software Engineer',
  };
};

export default async function Page(): Promise<JSX.Element> {
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce');

  return (
    <MotionConfig nonce={nonce ?? undefined} reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <Main />
      </LazyMotion>
    </MotionConfig>
  );
}
