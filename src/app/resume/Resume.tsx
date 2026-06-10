import type { ReactNode } from 'react';

type Experience = readonly [
  company: string,
  title: string,
  dates: readonly [start: string, end: string],
  description: ReactNode,
  technologies: readonly string[],
];

type Education = readonly [
  degree: string,
  specialization: string,
  institution: string,
  college: string,
  location: string,
];

const experience: readonly Experience[] = [
  [
    'Springthrough',
    'Web Developer',
    ['November 2014', 'June 2016'],
    'Worked in several teams of designers, developers, and project managers to build products and websites for clients across a wide variety of platforms and technologies. Solutions ranged from complex single page web applications to enterprise content management systems.',
    ['AngularJS', 'ASP.Net', 'C#', 'Sitefinity'],
  ],
  [
    'Varsity News Network',
    'Senior Software Engineer',
    ['June 2016', 'August 2017'],
    "As a lead frontend engineer I worked on two major initiatives. The first was to build a new modern WordPress theme which was rolled out to over 2000+ websites on the product platform. The new theme added responsive support and extensive customizations resulting in a significant increase of traffic. The second initiative was to optimize the company's advertising platform to enhance performance on available ad slots and ultimately increase CTR for customers and ROI for the company.",
    ['AngularJS', 'Elixir', 'React', 'Symfony', 'WordPress'],
  ],
  [
    'BLACK',
    'Full-Stack Software Engineer',
    ['August 2017', 'November 2018'],
    <>
      Worked with strategists and designers to understand and evaluate an organization’s current
      systems, processes, and technologies to develop strategies which enhanced what was working
      well and provided solutions where gaps existed.{' '}
      <br className="hidden min-[8.5in]:inline print:inline" />
      For many clients, we built robust cloud and micro-service solutions.
    </>,
    ['CraftCMS', 'Elixir', 'Node.js', 'React', 'TypeScript'],
  ],
  [
    'Dealer Inspire (Cars.com™)',
    'Product Developer',
    ['November 2018', 'Present'],
    <>
      Today, I am responsible for maintaining the integrity of the TypeScript codebase on the
      Conversations™ Platform. <br className="hidden min-[8.5in]:inline print:inline" />
      I am involved in the product’s evolution, including maintenance to the internal APIs and web
      applications, enhancing functionality and architectural components, and working with the
      product’s support team.
    </>,
    ['Node.js', 'React', 'TypeScript'],
  ],
];

const education: readonly Education[] = [
  [
    'Bachelor of Science, Computer Science & Engineering',
    'Specialization in Mathematics',
    'Michigan State University',
    'College of Engineering',
    'East Lansing, MI',
  ],
];

const contacts = [
  ['mailto:joshua@geschwendt.com', 'joshua@geschwendt.com'],
  ['https://github.com/jgeschwendt', 'github.com/jgeschwendt'],
  ['https://linkedin.com/in/jgeschwendt', 'linkedin.com/in/jgeschwendt'],
];

export { contacts, education, experience };
