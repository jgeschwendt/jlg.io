import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { Main } from './Main';
import { headers } from 'next/headers';
import type { JSX } from 'react';
import type { Metadata } from 'next';
import { statement } from './Statement';

export const generateMetadata = (): Metadata => ({
  description: statement(),
  title: 'Joshua L Geschwendt—Software Engineer',
});

export default async function Page(): Promise<JSX.Element> {
  const readonlyHeaders = await headers();

  const nonce = readonlyHeaders.get('x-nonce');

  return (
    <MotionConfig nonce={nonce ?? undefined}>
      <LazyMotion features={domAnimation} strict={true}>
        <Main />
      </LazyMotion>
    </MotionConfig>
  );
}
