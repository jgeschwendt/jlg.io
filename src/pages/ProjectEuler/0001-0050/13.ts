import { fixture } from './13.fixture';

/**
 * @link https://projecteuler.net/problem=13
 */
describe('Problem 13', () => {
  const solution = () => {
    const sum = fixture.reduce((t, n) => (t + n), BigInt(0));

    return Number(sum.toString().slice(0, 10));
  };

  test('Large sum', () => {
    expect(solution()).toBe(5537376230);
  });
});
