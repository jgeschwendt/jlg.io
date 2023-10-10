const interleave = <T extends unknown, K extends unknown>(
  list: T[],
  item: K,
): (T | K)[] => list.flatMap((node) => [node, item]).slice(0, -1);

const pipe =
  <T>(...functions: ((value: T) => T)[]) =>
  (initialValue: T) =>
    functions.reduce((v, f) => f(v), initialValue);

export { interleave, pipe };
