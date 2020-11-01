import * as is from './predicates';

export { is };

export function collatzSequenceCount(number: number, cache: Record<number, number> = {}): number {
  if (!cache[1]) {
    cache[1] = 1;
  }

  function collatzSequence(n: number): number {
    if (cache[n]) {
      return cache[n];
    }

    if (n % 2 === 0) {
      cache[n] = 1 + collatzSequence(n / 2);
    } else {
      cache[n] = 2 + collatzSequence(((3 * n) + 1) / 2);
    }

    return cache[n];
  }

  return collatzSequence(number);
}

export function divisorsCount(n: number): number {
  const sqrt = Math.sqrt(n);
  let count = 0;

  for (let i = 1; i <= sqrt; ++i) {
    if (n % i === 0) {
      if (i === n / i) {
        ++count;
      } else {
        count += 2;
      }
    }
  }

  return count;
}

export function fibonacci (limit: number): number[] {
  const terms = [1, 2];

  while (terms[terms.length - 1] <= limit) {
    terms.push(terms[terms.length - 2] + terms[terms.length - 1]);
  }

  return terms;
}

export function* primeGenerator(): Generator<number, number, number> {
  let candidate = 1;

  yield 2;
  while(true) {
    candidate = candidate + 2;
    if (is.prime(candidate)) {
      yield candidate;
    }
  }
}
