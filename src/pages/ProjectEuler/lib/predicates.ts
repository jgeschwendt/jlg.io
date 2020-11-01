export const palindrome = (term: number | string): boolean => (
  (string: string): boolean => string === Array.from(string).reverse().join('')
)(term.toString());

export const prime = (number: number): boolean => {
  if (number === 1) {
    return false;
  } else if (number < 4) {
    // 2 and 3 are prime
    return true;
  } else if (number % 2 === 0) {
    return false;
  } else if (number < 9) {
    // 4, 6 and 8 have already been declared false
    return true;
  } else if (number % 3 === 0) {
    return false;
  } else {
    const r = Math.floor(Math.sqrt(number));
    let f = 5;

    while (f <= r) {
      if (number % f === 0 || number % (f + 2) === 0) {
        return false;
      }

      f = f + 6;
    }
  }

  return true;
};
