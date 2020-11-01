import { fibonacci } from '../lib';

/**
 * @link https://projecteuler.net/problem=2
 */
describe('Problem 2', () => {
  const solution = (limit: number): number => (
    fibonacci(limit)
      .filter((n) => (n % 2 === 0))
      .reduce((t, n) => (t + n), 0)
  );

  test('Even Fibonacci numbers', () => {
    expect(solution(4000000)).toBe(4613732);
  });
});
