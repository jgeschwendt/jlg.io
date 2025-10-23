import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import { headers } from 'next/headers';
import type { JSX } from 'react';
import type { Metadata } from 'next';
import { Main, statement } from './home';
import { WaterBackground } from '@/components/WaterBackground';

export const generateMetadata = (): Metadata => ({
  description: statement(),
  title: 'Joshua L Geschwendt—Software Engineer',
});

export default async function Page(): Promise<JSX.Element> {
  const requestHeaders = await headers();

  const nonce = requestHeaders.get('x-nonce');

  return (
    <MotionConfig nonce={nonce ?? undefined}>
      <LazyMotion features={domAnimation} strict>
        <WaterBackground />
        <Main />
      </LazyMotion>
    </MotionConfig>
  );
}
