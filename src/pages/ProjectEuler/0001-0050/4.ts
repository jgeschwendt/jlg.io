import { is } from '../lib';

/**
 * @link https://projecteuler.net/problem=4
 */
describe('Problem 4', () => {
  // A = 100000x + 10000y + 1000z + 100z + 10y + x
  // A = 11 * (9091x + 910y + 100z)
  const solution = () => {
    let a = 999;
    let b = 999;
    let skip = 1;

    let palindrome: number;

    while (100 <= a) {
      if (a % 11 === 0) {
        b = 999;
        skip = 1;
      } else {
        b = 990; // next option, divisible by 11
        skip = 11;
      }

      while (a <= b) {
        const c = a * b;

        if (c <= palindrome) {
          break;
        } else if (is.palindrome(c)) {
          palindrome = c;
        }

        b = b - skip;
      }

      a = a - 1;
    }

    return palindrome;
  };

  test('Largest palindrome product', () => {
    expect(solution()).toBe(906609);
  });
});
