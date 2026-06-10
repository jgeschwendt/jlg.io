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

const experience: readonly Experience[] = [];

const education: readonly Education[] = [];

const contacts = [
  ['mailto:joshua@geschwendt.com', 'joshua@geschwendt.com'],
  ['https://github.com/jgeschwendt', 'github.com/jgeschwendt'],
  ['https://linkedin.com/in/jgeschwendt', 'linkedin.com/in/jgeschwendt'],
];

export { contacts, education, experience };
