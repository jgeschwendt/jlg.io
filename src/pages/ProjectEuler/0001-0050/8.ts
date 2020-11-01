import { fixture } from './8.fixture';

/**
 * @link https://projecteuler.net/problem=8
 */
describe('Problem 8', () => {
  const solution = (range: number): number => {
    let greatestProduct = 0;
    let i = 0;

    while (fixture[i + range]) {
      const product = fixture
        .slice(i, i + range)
        .split('')
        .reduce((t, n) => t * parseInt(n, 10), 1);

      if (greatestProduct < product) {
        greatestProduct = product;
      }

      i++;
    }

    return greatestProduct;
  };

  test('Largest product in a series', () => {
    expect(solution(4)).toBe(5832);
    expect(solution(13)).toBe(23514624000);
  });
});
