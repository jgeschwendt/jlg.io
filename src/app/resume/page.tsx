/// <reference types="react/canary" />
import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import type { JSX } from 'react';
import { Close } from './Close';
import { Sheet } from './Sheet';

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
