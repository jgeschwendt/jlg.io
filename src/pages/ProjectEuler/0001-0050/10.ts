import { primeGenerator } from '../lib';

/**
 * @link https://projecteuler.net/problem=10
 */
describe('Problem 10', () => {
  const solution = (limit: number): number => {
    const prime = primeGenerator();
    const primes = [] as number[];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextPrime = prime.next().value;
      if (nextPrime < limit) {
        primes.push(nextPrime);
      } else {
        break;
      }
    }

    return primes.reduce((t, n) => (t + n), 0);
  };

  test('Summation of primes', () => {
    expect(solution(10)).toBe(17);
    expect(solution(2000000)).toBe(142913828922);
  });
});
