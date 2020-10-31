import _ from 'lodash';

/**
 * If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9.
 * The sum of these multiples is 23. Find the sum of all the multiples of 3 or 5 below 1000.
 */
describe('Problem 1', () => {
  const solution = (input: number): number => (
    _.range(1, input)
      .filter((n) => (n % 3 === 0 || n % 5 === 0))
      .reduce((t, n) => (t + n), 0)
  );

  test('Multiples of 3 and 5', () => {
    expect(solution(10)).toBe(23);
    expect(solution(1000)).toBe(233168);
  });
});
