const CAREER_YEAR_START = 2012;

/** The home statement in pieces; `mark` wraps the words the page links. */
const statement = <T>(mark: (word: string) => T): (string | T)[] => {
  const years = String(new Date().getFullYear() - CAREER_YEAR_START);

  return [
    'I’m a seasoned software engineer with ',
    mark(years),
    ' years of professional experience located in West Michigan. I specialize in ',
    mark('AI'),
    ' augmented software.',
  ];
};

export { statement };
