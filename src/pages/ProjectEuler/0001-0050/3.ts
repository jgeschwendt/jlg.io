/**
 * @link https://projecteuler.net/problem=3
 */
describe('Problem 3', () => {
  const solution = (limit: number): number => {
    let n = limit;
    let factorLast = 1;

    if (n % 2 == 0) {
      n = n / 2;
      factorLast = 2;

      while (n % 2 === 0) {
        n = n / 2;
      }
    }

    let factor = 3;
    let factorMax = Math.sqrt(n);

    while (n > 1 && factor <= factorMax) {
      if (n % factor === 0) {
        n = n / factor;
        factorLast = factor;

        while (n % factor === 0) {
          n = n / factor;
        }

        factorMax = Math.sqrt(n);
      }

      factor = factor + 2;
    }

    if (n === 1) {
      return factorLast;
    }

    return n;
  };

  test('Largest prime factor', () => {
    expect(solution(600851475143)).toBe(6857);
  });
});
