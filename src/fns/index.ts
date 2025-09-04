function interleave<T, K>(list: readonly T[], item: K): (T | K)[] {
  return list.flatMap((node) => [node, item]).slice(0, -1);
}

function pipe<T>(...functions: readonly ((value: T) => T)[]) {
  return (initialValue: T): T => {
    let result = initialValue;

    for (const functionInPipe of functions) {
      result = functionInPipe(result);
    }

    return result;
  };
}

export { interleave, pipe };
