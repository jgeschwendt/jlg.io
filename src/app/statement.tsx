import { interleave, pipe } from '../lib';

const getYearsOfExperience = () => new Date().getFullYear() - 2012;

const statement = () =>
  [
    `I'm a seasoned web engineer with ${getYearsOfExperience()} years of professional experience located in West Michigan.`,
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
            <a
              className="text-[#FF0080]"
              href="https://nodejs.org/en/"
              key="node"
            >
              Node.js
            </a>
          ),
          replace(
            'React',
            <a
              className="text-[#FF0080]"
              href="https://reactjs.org/"
              key="react"
            >
              React
            </a>
          )
        )(statement().split(' ')),
        ' '
      )}
    </>
  );
}

export { Statement, statement };
