/**
 * 2520 is the smallest number that can be divided by each of the numbers from 1 to 10 without any remainder.
 *
 * What is the smallest positive number that is evenly divisible by all of the numbers from 1 to 20?
 */
describe('Problem 5', () => {
  const solution = (multiple: number) => {
    const limit = Math.sqrt(multiple);

    const powers: number[] = [];

    // todo: use generator to build this array
    const primes = [1, 2, 3, 5, 7, 11, 13, 17, 19];

    let i = 1;
    let check = true;
    let smallestMultiple = 1;

    while (primes[i] <= multiple) {
      powers[i] = 1;

      if (check) {
        if (primes[i] <= limit) {
          powers[i] = Math.floor(Math.log(multiple) / Math.log(primes[i]));
        } else {
          check = false;
        }
      }

      smallestMultiple = smallestMultiple * Math.pow(primes[i], powers[i]);

      i++;
    }

    return smallestMultiple;
  };

  test('Smallest multiple', () => {
    expect(solution(10)).toBe(2520);
    expect(solution(20)).toBe(232792560);
  });
});
