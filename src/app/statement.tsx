import Link from 'next/link';
import { Fragment, type JSX } from 'react';
import { interleave, pipe } from '../lib';

const getYearsOfExperience = () => new Date().getFullYear() - 2012;

const statement = () =>
  [
    `I’m a seasoned web engineer with ${getYearsOfExperience()} years of professional experience located in West Michigan.`,
    `I specialize in Node.js services and React applications.`,
  ].join(' ');

const replace =
  (value: string, replacement: JSX.Element) =>
  (words: (string | JSX.Element)[]) => {
    const index = words.findIndex((word) => word === value);
    return index > -1
      ? [...words.slice(0, index), replacement, ...words.slice(index + 1)]
      : words;
  };

function Statement() {
  return (
    <>
      {interleave(
        pipe(
          replace(
            'Node.js',
            <Link
              href="https://nodejs.org/en/"
              style={{ color: '#339933', fontWeight: 500 }}
            >
              {'Node.js'}
            </Link>,
          ),
          replace(
            'React',
            <Link
              href="https://react.dev/"
              style={{ color: '#149eca', fontWeight: 500 }}
            >
              {'React'}
            </Link>,
          ),
        )(statement().split(' ')),
        ' ',
      ).map((component, key) => (
        <Fragment key={key}>{component}</Fragment>
      ))}
    </>
  );
}

export { Statement, statement };
