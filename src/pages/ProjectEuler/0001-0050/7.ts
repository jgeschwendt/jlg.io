import { primeGenerator } from '../lib';

/**
 * @link https://projecteuler.net/problem=7
 */
describe('Problem 7', () => {
  const solution = (primeIndex: number): number => {
    const prime = primeGenerator();
    const primes = [] as number[];

    while (primes.length < primeIndex) {
      primes.push(prime.next().value);
    }

    return primes.pop();
  };

  test('10001st prime', () => {
    expect(solution(6)).toBe(13);
    expect(solution(10001)).toBe(104743);
  });
});
