/**
 * @link https://projecteuler.net/problem=6
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
