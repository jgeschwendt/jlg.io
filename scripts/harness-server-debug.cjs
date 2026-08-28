// Preloaded through `bunfig.toml` into every bun process from this directory,
// armed only when the harness server sets HARNESS_SERVER_DEBUG=1 (Server::start
// in crates/harness). Surfaces failures the server would otherwise swallow: an
// async error inside a streamed render can die without a line on either stream
// while the response ships Next's __next_error__ shell. The guard matters —
// these handlers replace bun's default die-on-uncaught, which no ordinary
// dev/build process should lose.
if (process.env.HARNESS_SERVER_DEBUG === '1') {
  process.on('uncaughtException', (error) => {
    console.error('[harness-debug] uncaughtException:', error);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[harness-debug] unhandledRejection:', reason);
  });
}
