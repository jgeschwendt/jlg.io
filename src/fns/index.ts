const interleave = <T, K>(list: readonly T[], item: K): (T | K)[] =>
  list.flatMap((node) => [node, item]).slice(0, -1);

const pipe =
  <T>(...functions: readonly ((value: T) => T)[]) =>
  (initialValue: T): T => {
    let result = initialValue;

    for (const functionInPipe of functions) {
      result = functionInPipe(result);
    }

    return result;
  };

export { interleave, pipe };
