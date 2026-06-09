'use client';

import { type JSX, type MouseEvent, type ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Modal({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  const router = useRouter();

  const handleBackdropClick = useCallback(() => {
    router.back();
  }, [router]);

  const handleContentClick = useCallback((event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
    >
      <main
        className="relative mx-auto max-h-[90vh] overflow-y-auto bg-white text-black lg:min-h-[11in] lg:max-w-[8in]"
        onClick={handleContentClick}
      >
        <Link
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
          href="/"
        >
          {'✕'}
        </Link>
        {children}
      </main>
    </div>
  );
}
