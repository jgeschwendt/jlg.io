import { divisorsCount } from '../lib';

/**
 * @link https://projecteuler.net/problem=12
 */
describe('Problem 12', () => {
  const solution = (limit: number): number => {
    let divisors = 0;
    let nNumber = 1;
    let tNumber = 0;

    while (divisors < limit) {
      tNumber += nNumber;
      divisors = divisorsCount(tNumber);
      nNumber++;
    }

    return tNumber;
  };

  test('Highly divisible triangular number', () => {
    expect(solution(5)).toBe(28);
    expect(solution(500)).toBe(76576500);
  });
});
