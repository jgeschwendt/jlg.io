'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type JSX, useEffect } from 'react';

export function Close(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        router.push('/');
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return (
    <Link
      aria-label="Close résumé"
      className="fixed top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg border-2 border-black/5 bg-black/5 text-black transition duration-300 hover:border-black/10 hover:bg-black/10 lg:border-[oklch(1_0_0/.05)] lg:bg-[oklch(1_0_0/.05)] lg:text-white lg:hover:border-[oklch(1_0_0/.1)] lg:hover:bg-[oklch(1_0_0/.1)] print:hidden"
      href="/"
    >
      <span aria-hidden>{'✕'}</span>
    </Link>
  );
}
