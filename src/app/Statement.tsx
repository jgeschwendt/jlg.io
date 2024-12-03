import Link from 'next/link';
import { Fragment, type JSX } from 'react';
import { interleave, pipe } from '../lib';

function getYearsOfExperience(): number {
  const CAREER_YEAR_START = 2012;
  return new Date().getFullYear() - CAREER_YEAR_START;
}

function statement(): string {
  return [
    `I’m a seasoned web engineer with ${getYearsOfExperience()} years of professional experience located in West Michigan.`,
    `I specialize in Node.js services and React applications.`,
  ].join(' ');
}

function replace(value: string, replacement: JSX.Element) {
  return (words: (string | JSX.Element)[]): (string | JSX.Element)[] => {
    if (words.includes(value)) {
      const index = words.indexOf(value);
      return [...words.slice(0, index), replacement, ...words.slice(index + 1)];
    }

    return words;
  };
}

function Statement(): JSX.Element[] {
  return interleave(
    pipe(
      replace(
        'Node.js',
        <Link
          className="font-medium text-[#339933]"
          href="https://nodejs.org/en/"
        >
          {'Node.js'}
        </Link>,
      ),
      replace(
        'React',
        <Link className="font-medium text-[#149eca]" href="https://react.dev/">
          {'React'}
        </Link>,
      ),
    )(statement().split(' ')),
    ' ',
  ).map((component, key) => <Fragment key={key}>{component}</Fragment>);
}

export { Statement, statement };
