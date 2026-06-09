import type { JSX } from 'react';

import { contacts, education, experience } from './Resume';

export default function Page(): JSX.Element {
  return (
    <main className="mx-auto bg-white text-black lg:my-16 lg:min-h-[11in] lg:max-w-[8in] print:my-0 print:h-[11in] print:w-[8.5in]">
      <div className="p-8">
        <header className="mb-8 border-b-2 border-black pb-4">
          <h1 className="mb-2 text-3xl font-bold">{'Joshua L Geschwendt'}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            {contacts.map(([href, display]) => (
              <a className="hover:underline" href={href} key={href}>
                {display}
              </a>
            ))}
          </div>
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">{'Experience'}</h2>
          {experience.map(
            ([company, title, [start, end], description, technologies]) => (
              <div className="mb-6" key={company}>
                <div className="mb-1 flex items-baseline justify-between">
                  <h3 className="font-bold">{company}</h3>
                  <span className="text-sm text-gray-600">
                    {start}
                    {' — '}
                    {end}
                  </span>
                </div>
                <div className="mb-2 text-sm italic">{title}</div>
                <div className="mb-2 text-sm">{description}</div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {technologies.map((tech) => (
                    <span className="rounded bg-gray-200 px-2 py-1" key={tech}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ),
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">{'Education'}</h2>
          {education.map(
            ([degree, specialization, institution, college, location]) => (
              <div key={degree}>
                <div className="font-bold">{degree}</div>
                <div className="text-sm italic">{specialization}</div>
                <div className="text-sm">{institution}</div>
                <div className="text-sm">{college}</div>
                <div className="text-sm text-gray-600">{location}</div>
              </div>
            ),
          )}
        </section>
      </div>
    </main>
  );
}
