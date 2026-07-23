import { Atkinson_Hyperlegible_Next as atkinsonHyperlegibleNext } from 'next/font/google';
import type { JSX } from 'react';

import { contacts, education, experience } from './Resume';

const atkinson = atkinsonHyperlegibleNext({
  // Next has no fallback metrics for this font; opt out to keep builds clean.
  adjustFontFallback: false,
  fallback: ['sans-serif'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export function Sheet(): JSX.Element {
  return (
    <div
      className={`${atkinson.className} flex min-h-svh flex-col bg-white leading-none font-extralight text-black/66 lg:bg-transparent lg:py-8 print:py-0`}
    >
      <main className="mx-auto flex w-full flex-col bg-white px-6 py-12 lg:my-auto lg:h-[11in] lg:max-w-[8.5in] lg:p-[0.75in_0.5in_0.5in] print:m-auto print:h-[11in] print:w-[8.5in] print:p-[0.75in_0.5in_0.5in]">
        <header className="mb-10">
          <h1 className="text-[1.375rem] font-medium tracking-[0.5px] text-[#18453b] uppercase">
            {'Joshua L Geschwendt'}
          </h1>
        </header>

        <section className="mb-6 flex-1">
          <h2 className="mb-5 text-[0.8125rem] font-medium text-[#18453b] uppercase">
            {'Experience'}
          </h2>
          <ol className="flex flex-col-reverse">
            {experience.map(([company, title, [start, end], highlights, technologies]) => (
              <li className="not-first:mb-8 min-[8.5in]:not-first:mb-7" key={company}>
                <div className="mb-2 flex flex-col gap-1 min-[8.5in]:flex-row min-[8.5in]:items-baseline min-[8.5in]:justify-between min-[8.5in]:gap-4">
                  <h3 className="text-[0.8125rem] font-medium text-black/87">
                    {company}
                    <span className="text-[0.75rem] font-light text-black/66">
                      {`\u2002·\u2002${title}`}
                    </span>
                  </h3>
                  <span className="text-[0.75rem] whitespace-nowrap text-black/55">
                    {`${start} – ${end}`}
                  </span>
                </div>
                <ul className="mb-2 list-disc space-y-1.5 pl-4 text-[0.75rem] leading-snug marker:text-black/35">
                  {highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <div className="text-[0.75rem]">
                  <span className="font-normal text-black/87">{'Stack:'}</span>
                  {`\u2002${technologies.join('\u2002·\u2002')}`}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex flex-col gap-10 min-[8.5in]:flex-row min-[8.5in]:gap-0">
          <div className="flex-1">
            <h2 className="mb-5 text-[0.8125rem] font-medium text-[#18453b] uppercase">
              {'Education'}
            </h2>
            <div className="space-y-2 text-[0.75rem] leading-snug">
              {education.map(([degree, specialization, institution, college, location]) => (
                <div key={degree}>
                  <div>
                    <span className="font-normal text-black/87">{degree}</span>
                    <i>{`\u2002·\u2002${specialization}`}</i>
                  </div>
                  <div>{`${institution}, ${college}`}</div>
                  <div>{location}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-5 text-[0.8125rem] font-medium text-[#18453b] uppercase">
              {'Contact'}
            </h2>
            <div className="space-y-1.5 text-[0.75rem] leading-snug">
              {contacts.map(([href, display]) => (
                <a
                  className="block text-black/87 hover:text-black hover:underline"
                  href={href}
                  key={href}
                >
                  {display}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
