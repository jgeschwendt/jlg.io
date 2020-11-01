/**
 * @link https://projecteuler.net/problem=15s
 */
describe('Problem 15', () => {
  const solution = (n: number): number => {
    let c = 1;

    for (let i = 1; i <= n; i++) {
      c = c * (n + i) / i;
    }

    return c;
  };

  test('stub', () => {
    expect(solution(2)).toBe(6);
    expect(solution(20)).toBe(137846528820);
  });
});
