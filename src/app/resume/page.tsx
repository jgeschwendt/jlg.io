/// <reference types="react/canary" />
import type { Metadata } from 'next';
import { type JSX, ViewTransition } from 'react';
import { Close } from './close';
import { Sheet } from './sheet';

export const metadata: Metadata = { title: 'Joshua L Geschwendt—Résumé' };

export default function Page(): JSX.Element {
  return (
    <>
      <Close />
      <ViewTransition default="sheet">
        <Sheet />
      </ViewTransition>
    </>
  );
}
