import Link from 'next/link';
import { Fragment } from 'react';
import type { JSX } from 'react';
import { intersperse, pipe } from '@/fns';

function getYearsOfExperience(): number {
  const CAREER_YEAR_START = 2012;
  return new Date().getFullYear() - CAREER_YEAR_START;
}

function statement(): string {
  return [
    `I’m a seasoned software engineer with ${getYearsOfExperience()} years of professional experience located in West Michigan.`,
    `I specialize in AI augmented software.`,
  ].join(' ');
}

function replace(value: string, replacement: JSX.Element) {
  return (words: (string | JSX.Element)[]): (string | JSX.Element)[] =>
    words.map((word) => (word === value ? replacement : word));
}

function Statement(): JSX.Element[] {
  const years = String(getYearsOfExperience());

  return intersperse(
    pipe(
      replace(
        years,
        <Link className="font-bold" href="/">
          {years}
        </Link>,
      ),
      replace(
        'AI',
        <Link className="font-bold" href="/">
          {'AI'}
        </Link>,
      ),
    )(statement().split(' ')),
    ' ',
  )
    .map((component, key) => [component, key] as const)
    .map(([component, key]) => <Fragment key={key}>{component}</Fragment>);
}

export { Statement, statement };
