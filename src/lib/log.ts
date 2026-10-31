const log = function log(...data: unknown[]): void {
  console.info(...data);
};

log.error = function error(data: string, options: ErrorOptions): void {
  console.error(data, options);
};

export { log };
