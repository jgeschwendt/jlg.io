export * as is from './predicates';

export function fibonacci (limit: number): number[] {
  const terms = [1, 2];

  while (terms[terms.length - 1] <= limit) {
    terms.push(terms[terms.length - 2] + terms[terms.length - 1]);
  }

  return terms;
}

export function* primeGenerator(start = 0): Generator<number> {
  let term = start;
  yield term;

  while(true) {
    // todo: find next prime number
    term = term + 1;
    yield term;
  }
}
