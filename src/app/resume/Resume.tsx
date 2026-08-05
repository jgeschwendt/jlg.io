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
      'Delivered client projects ranging from single-page applications to enterprise content management systems.',
    ],
    ['AngularJS', 'C#', 'Node.js'],
  ],
  [
    'Varsity News Network',
    'Senior Software Engineer',
    ['June 2016', 'August 2017'],
    [
      'Built a modern WordPress theme and rolled it out across 2,000+ school athletics sites, significantly increasing traffic.',
      'Migrated the platform’s PHP REST API to Elixir, adding GraphQL support, and its AngularJS app to React.',
      'Optimized ad-slot performance across the network, raising client CTR and company ROI.',
    ],
    ['Elixir', 'Node.js', 'PHP', 'React', 'WordPress'],
  ],
  [
    'BLACK',
    'Senior Software Engineer',
    ['August 2017', 'November 2018'],
    [
      'Assessed client systems with strategists and designers, then built the software to close the gaps.',
    ],
    ['Elixir', 'Node.js', 'React', 'TypeScript'],
  ],
  [
    'Cars.com (Dealer Inspire)',
    'Senior Product Developer',
    ['November 2018', 'December 2020'],
    [
      'Architected and built the chat component shipped across Cars.com and Dealer Inspire products, serving thousands of dealerships and millions of messages per day.',
      'Set TypeScript standards and architecture for the Conversations™ platform alongside its principal engineer.',
    ],
    ['Node.js', 'React', 'TypeScript'],
  ],
  [
    'Rocket Homes',
    'Staff Software Engineer',
    ['January 2021', 'July 2025'],
    [
      'Led the migration of rockethomes.com to TypeScript and modern React, improving stability and usability across the platform.',
      'Defined the site’s architecture and engineering standards, then led its move from a homegrown framework to Next.js.',
      'Repeatedly halved deploy and CI times, and cut dev-tooling startup from minutes to near-instant.',
    ],
    ['Next.js', 'Node.js', 'React', 'TypeScript'],
  ],
  [
    'Rocket',
    'Staff Software Engineer',
    ['July 2025', 'Present'],
    [
      'Rebuilt Rocket Mortgage’s servicing platform from Angular to Next.js in six months, compressing a multi-year scope with AI-assisted development, and unified Rocket and Mr. Cooper clients on a single platform.',
      'Dreamed up, built, and shipped remote development environments: collaborative spaces that embed AI harnesses in the live application, letting any team make changes together from a URL with no setup.',
      'Mentor team members and guide the organization’s transition to AI-forward engineering.',
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
  ['https://github.com/jgeschwendt', 'github.com/jgeschwendt'],
  ['https://linkedin.com/in/jgeschwendt', 'linkedin.com/in/jgeschwendt'],
];

export { contacts, education, experience };
