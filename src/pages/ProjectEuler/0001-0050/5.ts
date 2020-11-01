import { primeGenerator } from '../lib';

/**
 * @link https://projecteuler.net/problem=5
 */
describe('Problem 5', () => {
  const solution = (multiple: number) => {
    const limit = Math.sqrt(multiple);
    const powers: number[] = [];
    const prime = primeGenerator();
    const primes = [prime.next().value];

    while (primes[primes.length - 1] < multiple) {
      primes.push(prime.next().value);
    }

    let i = 0;
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
