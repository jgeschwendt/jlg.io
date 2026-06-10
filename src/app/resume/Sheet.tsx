import { Fragment, type JSX } from 'react';

import { contacts, education, experience } from './Resume';

const SEPARATOR =
  "relative px-2 before:absolute before:top-1/2 before:-left-1 before:-translate-y-1/2 before:text-[1rem] before:leading-none before:content-['·']";

export function Sheet(): JSX.Element {
  return (
    <div className="flex min-h-svh flex-col bg-white leading-none font-extralight text-black/66 lg:bg-transparent lg:py-8 print:py-0">
      <main className="mx-auto flex w-full flex-col bg-white px-6 py-12 lg:my-auto lg:h-[11in] lg:max-w-[8.5in] lg:p-[0.75in_0.5in_0.5in] print:m-auto print:h-[11in] print:w-[8.5in] print:p-[0.75in_0.5in_0.5in]">
        <header className="mb-10">
          <h1 className="text-[1.375rem] font-medium tracking-[0.5px] text-[#18453b] uppercase">
            {'Joshua L Geschwendt'}
          </h1>
        </header>

        <section className="mb-8 flex flex-1 flex-col">
          <h2 className="mb-5 text-[0.875rem] font-medium text-[#18453b] uppercase">
            {'Experience'}
          </h2>
          <ol className="flex h-full flex-col-reverse justify-between">
            {experience.map(([company, title, [start, end], description, technologies]) => (
              <li className="not-first:mb-8 min-[8.5in]:not-first:mb-4" key={company}>
                <h3 className="mb-2 text-[0.875rem] font-medium text-black/87">{company}</h3>
                <h4 className="mb-2 text-[0.875rem] font-light text-black/87">
                  {`${title}\u2002·\u2002${start} to ${end}`}
                </h4>
                <p className="mb-3 text-[0.875rem] leading-normal">{description}</p>
                <div className="text-[0.875rem]">
                  {/* The original page declared body weight 200, so <b>'s `bolder`
                      resolved to 400 — regular, not bold. */}
                  <b className="font-normal">{'Stack:'}</b>
                  {technologies.map((tech, index) => (
                    <Fragment key={tech}>
                      {' '}
                      <span className={index === 0 ? 'relative px-2' : SEPARATOR}>{tech}</span>
                    </Fragment>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex">
          <div className="flex-1 text-[0.875rem] [&_div+div]:mt-2">
            <h2 className="mb-5 text-[0.875rem] font-medium text-[#18453b] uppercase">
              {'Education'}
            </h2>
            {education.map(([degree, specialization, institution, college, location]) => (
              <Fragment key={degree}>
                <div>
                  <div>
                    <b className="font-normal">{degree}</b>
                  </div>
                  <div>
                    <i>{specialization}</i>
                  </div>
                </div>
                <div>
                  <div>{institution}</div>
                  <div>{college}</div>
                  <div>{location}</div>
                </div>
              </Fragment>
            ))}
          </div>
          <div className="text-[0.875rem]">
            <h2 className="mb-5 text-[0.875rem] font-medium text-[#18453b] uppercase">
              {'Contact'}
            </h2>
            {contacts.map(([href, display]) => (
              <a
                className="mb-2 block text-black/87 hover:text-black hover:underline"
                href={href}
                key={href}
              >
                {display}
              </a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
