import { collatzSequenceCount } from "../lib";

/**
 * @link https://projecteuler.net/problem=14
 */
describe('Problem 14', () => {
  const solution = (limit: number): number => {
    const cache = {};

    let count = 0;
    let countTuple = [0, 0];

    // If the limit is even, skip the first half.
    let i = limit % 2 === 0 ? limit / 2 : limit;

    while (i < limit) {
      count = collatzSequenceCount(i, cache);

      if (countTuple[1] < count) {
        countTuple = [i, count];
      }

      i++;
    }

    return countTuple[0];
  };

  test('Longest Collatz sequence', () => {
    expect(collatzSequenceCount(13)).toBe(10);
    expect(solution(1000000)).toBe(837799);
  });
});

