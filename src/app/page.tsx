import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { connection } from 'next/server';
import type { JSX } from 'react';
import { Main, statement } from './home';

export const generateMetadata = async (): Promise<Metadata> => {
  await connection();
  return {
    description: statement(String).join(''),
    title: 'Joshua L Geschwendt—Software Engineer',
  };
};

export default async function Page(): Promise<JSX.Element> {
  const requestHeaders = await headers();
  const nonce = requestHeaders.get('x-nonce');

  return (
    <MotionConfig nonce={nonce ?? undefined} reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {/* <Background /> parked: the fluid sim is incomplete — remount when it ships. */}
        <Main />
      </LazyMotion>
    </MotionConfig>
  );
}
