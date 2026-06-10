const log = function log(...data: unknown[]): void {
  globalThis.console.info(...data);
};

log.error = function error(data: string, options: ErrorOptions): void {
  globalThis.console.error(data, options);
};

export { log };
