/**
 * The sum of the squares of the first ten natural numbers is,
 *
 *   1^2 + 2^2 + ... + 10^2 = 385
 *
 * The square of the sum of the first ten natural numbers is,
 *
 *   (1 + 2 + ... + 10)^2 = 55^2 = 3025
 *
 * Hence the difference between the sum of the squares of the first ten natural numbers and the square of the sum is .
 *
 *   3025 - 385 = 2640
 *
 * Find the difference between the sum of the squares of the first one hundred natural numbers and the square of the sum.
 */
describe('Problem 6', () => {
  const solution = (limit: number): number => {
    const sumOfSquares = (2 * limit + 1) * (limit + 1) * limit / 6;
    const squareOfSums = Math.pow(limit * (limit + 1) / 2, 2);

    return squareOfSums - sumOfSquares;
  };

  test('Sum square difference', () => {
    expect(solution(10)).toBe(2640);
    expect(solution(100)).toBe(25164150);
  });
});
