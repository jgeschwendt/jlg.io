import { fixture } from "./11.fixture";

/**
 * @link https://projecteuler.net/problem=11
 */
describe('Problem 11', () => {
  const solution = (): number => {
    let greatestProduct = 0;

    // todo: this can be refactor significantly
    for (let i = 0; i < fixture.length; i++) {
      for (let j = 0; j < fixture[i].length; j++) {
        if (fixture[i][j + 3]) {
          const product = (fixture[i][j] * fixture[i][j + 1] * fixture[i][j + 2] * fixture[i][j + 3]);

          if (greatestProduct < product) {
            greatestProduct = product;
          }
        }

        if (fixture[i + 3]?.[j]) {
          const product = (fixture[i][j] * fixture[i + 1][j] * fixture[i + 2][j] * fixture[i + 3][j]);

          if (greatestProduct < product) {
            greatestProduct = product;
          }
        }

        if (fixture[i + 3]?.[j - 3]) {
          const product = (fixture[i][j] * fixture[i + 1][j - 1] * fixture[i + 2][j - 2] * fixture[i + 3][j - 3]);

          if (greatestProduct < product) {
            greatestProduct = product;
          }
        }

        if (fixture[i + 3]?.[j + 3]) {
          const product = (fixture[i][j] * fixture[i + 1][j + 1] * fixture[i + 2][j + 2] * fixture[i + 3][j + 3]);

          if (greatestProduct < product) {
            greatestProduct = product;
          }
        }
      }
    }

    return greatestProduct;
  };

  test('Largest product in a grid', () => {
    expect(solution()).toBe(70600674);
  });
});
