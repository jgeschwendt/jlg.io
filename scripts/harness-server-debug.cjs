// Preloaded into the suite's `next start` (Server::start sets NODE_OPTIONS) to
// surface failures the server would otherwise swallow: an async error inside a
// streamed render can die without a line on either stream while the response
// ships Next's __next_error__ shell. Real node honors the --require; bun's
// node shim ignores NODE_OPTIONS, so locally this is inert — which is fine,
// because the silence only ever happened on CI.
process.on('uncaughtException', (error) => {
  console.error('[harness-debug] uncaughtException:', error);
});
process.on('unhandledRejection', (reason) => {
  console.error('[harness-debug] unhandledRejection:', reason);
});
