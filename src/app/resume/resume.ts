type Experience = readonly [
  company: string,
  title: string,
  dates: readonly [start: string, end: string],
  highlights: readonly string[],
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
    'Applications Developer',
    ['November 2014', 'June 2016'],
    [
      'Rebuilt Haworth’s website and delivered projects for Delphi, Spectrum Health (now Corewell Health), and other enterprise clients.',
    ],
    ['AngularJS', 'C#', 'Node.js'],
  ],
  [
    'Varsity News Network',
    'Senior Software Engineer',
    ['June 2016', 'August 2017'],
    [
      'Migrated the PHP REST API to Elixir with GraphQL, and the AngularJS app to React.',
      'Built and rolled out a WordPress theme across 1,700+ school athletics sites.',
    ],
    ['Elixir', 'Node.js', 'PHP', 'React', 'WordPress'],
  ],
  [
    'BLACK',
    'Senior Software Engineer',
    ['August 2017', 'November 2018'],
    [
      'Embedded with strategists and designers to audit client systems, then built the software that closed the gaps.',
    ],
    ['Elixir', 'Node.js', 'React', 'TypeScript'],
  ],
  [
    'Cars.com (Dealer Inspire)',
    'Senior Product Developer',
    ['November 2018', 'December 2020'],
    [
      'Architected and built the Cars.com and Dealer Inspire chat component, handling millions of messages for thousands of dealerships.',
      'Established TypeScript standards and architecture for the Conversations platform alongside its principal engineer.',
    ],
    ['Node.js', 'React', 'TypeScript'],
  ],
  [
    'Rocket Homes',
    'Staff Software Engineer',
    ['January 2021', 'July 2025'],
    [
      'Led rockethomes.com’s move from a homegrown framework to Next.js, cutting errors and lifting Core Web Vitals, SEO, and conversion.',
      'Defined rockethomes.com’s architecture and engineering standards, now the foundation of Rocket Mortgage’s servicing app.',
      'Repeatedly halved deploy and CI times; cut dev-server startup from 2–5 minutes to near-instant.',
    ],
    ['Next.js', 'Node.js', 'React', 'TypeScript'],
  ],
  [
    'Rocket',
    'Staff Software Engineer',
    ['July 2025', 'Present'],
    [
      'Laid the groundwork for Rocket Mortgage’s AI-assisted servicing rebuild, building the first pages end to end on its foundational team before more teams scaled it out for nearly 10M clients in six months, not years.',
      'Keep rocket.com’s build, test, and deploy loop fast and trustworthy, giving engineers and AI agents the confidence to move quickly while agents on routines handle the upkeep.',
      'Mentor engineers and give talks on working effectively with generative AI as Rocket shifts to AI-forward engineering.',
    ],
    ['Elixir', 'Next.js', 'Node.js', 'Rust', 'TypeScript'],
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
  ['https://joshua.geschwendt.com', 'joshua.geschwendt.com'],
  ['https://github.com/jgeschwendt', 'github.com/jgeschwendt'],
];

const region = 'West Michigan';

export { contacts, education, experience, region };
