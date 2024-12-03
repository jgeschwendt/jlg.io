import type { JSX } from 'react';

export default function Page(): JSX.Element {
  return (
    <main className="mx-auto flex bg-white text-black lg:my-16 lg:min-h-[11in] lg:max-w-[8in] print:my-0 print:h-[11in] print:w-[8.5in]">
      <div className="flex flex-1 items-center justify-center">
        <h1 className="my-16 font-bold">Joshua L Geschwendt</h1>
      </div>
    </main>
  );
}
